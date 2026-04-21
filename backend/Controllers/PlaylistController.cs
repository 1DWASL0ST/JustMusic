using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using backendAPI.DTO;
using System.Security.Claims;

namespace backendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistsController : ControllerBase
    {
        private readonly DataDbContext _context;
        private readonly ILogger<PlaylistsController> _logger;

        public PlaylistsController(DataDbContext context, ILogger<PlaylistsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Playlist>>> GetPlaylists()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlists = await _context.Playlists
                .Where(p => p.IDUser == userId)
                .ToListAsync();

            return Ok(playlists);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Playlist>> GetPlaylist(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDPlaylist == id && p.IDUser == userId);

            if (playlist == null)
                return NotFound();

            return Ok(playlist);
        }

        [Authorize]
        [HttpGet("{id}/tracks")]
        public async Task<ActionResult<IEnumerable<Track>>> GetPlaylistTracks(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDPlaylist == id && p.IDUser == userId);

            if (playlist == null)
                return NotFound();

            var tracks = await _context.PlaylistsList
                .Where(pll => pll.IDPlaylist == id)
                .OrderBy(pll => pll.Position)
                .Select(pll => pll.Track)
                .Include(t => t.IDArtist)
                .Include(t => t.IDAlbum)
                .ToListAsync();

            return Ok(tracks);
        }

        // POST: api/Playlists — создать плейлист
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Playlist>> CreatePlaylist([FromBody] CreatePlaylist request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlist = new Playlist
            {
                PlaylistName = request.PlaylistName,
                IDUser = userId
            };

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlaylist), new { id = playlist.IDPlaylist }, playlist);
        }

        [Authorize]
        [HttpPost("{playlistId}/tracks/{trackId}")]
        public async Task<IActionResult> AddTrackToPlaylist(int playlistId, int trackId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDPlaylist == playlistId && p.IDUser == userId);

            if (playlist == null)
                return NotFound(new { message = "Плейлист не найден" });

            var track = await _context.Tracks.FindAsync(trackId);
            if (track == null)
                return NotFound(new { message = "Трек не найден" });

            var existing = await _context.PlaylistsList
                .FirstOrDefaultAsync(ps => ps.IDPlaylist == playlistId && ps.IDSong == trackId);

            if (existing != null)
                return BadRequest(new { message = "Трек уже в плейлисте" });

            // Определяем позицию
            var maxPosition = await _context.PlaylistsList
                .Where(ps => ps.IDPlaylist == playlistId)
                .MaxAsync(ps => (int?)ps.Position) ?? 0;

            var playlistSong = new PlaylistList
            {
                IDPlaylist = playlistId,
                IDSong = trackId,
            };

            _context.PlaylistsList.Add(playlistSong);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Трек добавлен в плейлист" });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaylist(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var playlist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDPlaylist == id && p.IDUser == userId);

            if (playlist == null)
                return NotFound();

            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [Authorize]
        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikeTrack(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favoritePlaylist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDUser == userId && p.PlaylistName == "Избранное");

            if (favoritePlaylist == null)
            {
                favoritePlaylist = new Playlist
                {
                    PlaylistName = "Избранное",
                    IDUser = userId
                };
                _context.Playlists.Add(favoritePlaylist);
                await _context.SaveChangesAsync();
            }

            var existing = await _context.PlaylistsList
                .FirstOrDefaultAsync(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist && ps.IDSong == id);

            if (existing != null)
            {
                _context.PlaylistsList.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { liked = false });
            }

            var maxPosition = await _context.PlaylistsList
                .Where(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist)
                .MaxAsync(ps => (int?)ps.Position) ?? 0;

            _context.PlaylistsList.Add(new PlaylistList
            {
                IDPlaylist = favoritePlaylist.IDPlaylist,
                IDSong = id,
                Position = maxPosition + 1
            });
            await _context.SaveChangesAsync();

            return Ok(new { liked = true });
        }

        [Authorize]
        [HttpGet("{id}/like-status")]
        public async Task<IActionResult> GetLikeStatus(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favoritePlaylist = await _context.Playlists
                .FirstOrDefaultAsync(p => p.IDUser == userId && p.PlaylistName == "Избранное");

            if (favoritePlaylist == null)
                return Ok(new { liked = false });

            var exists = await _context.PlaylistsList
                .AnyAsync(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist && ps.IDSong == id);

            return Ok(new { liked = exists });
        }
    }
}