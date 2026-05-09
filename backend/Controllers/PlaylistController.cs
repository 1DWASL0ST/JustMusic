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
                .Select(pll => new TrackCommon
                {
                    IDSong = pll.Track!.IDSong,
                    TrackName = pll.Track.TrackName,
                    IDArtist = pll.Track.IDArtist,
                    IDAlbum = pll.Track.IDAlbum,
                    PathSong = pll.Track.PathSong,
                    Artist = new ArtistInfo
                    {
                        ArtistName = pll.Track!.artist!.ArtistName
                    },
                    Album = new AlbumInfo
                    {
                        AlbumName = pll.Track!.album!.AlbumName,
                        AlbumPicture = pll.Track!.album!.AlbumPicture
                    }
                })
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

    }
}