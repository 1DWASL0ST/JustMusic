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
    public class TrackController : ControllerBase
    {

        private readonly ILogger<TrackController> _logger;
        private readonly DataDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public TrackController(DataDbContext context, ILogger<TrackController> logger, IConfiguration configuration)
        {
            _dbContext = context;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Track>>> GetTracks()
        {
            try
            {
                var tracks = await _dbContext.Tracks
                    .Include(track => track.artist)
                    .Include(t => t.album)
                    .ToListAsync();

                return Ok(tracks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка треков");
                return StatusCode(500, "Треки не найдены");
            }
        }

        [HttpGet("stream/{id}")]
        public async Task<IActionResult> Stream(int id)
        {
            try
            {
                Track track = await _dbContext.Tracks.FindAsync(id);

                var TrackFolder = _configuration["TracksSettings:TracksFolder"];
                var TrackPath = Path.Combine(TrackFolder, track.PathSong);

                return PhysicalFile(TrackPath, "audio/mpeg", enableRangeProcessing: true);
            
            }
            catch
            {
                return StatusCode(500, "Ошибка при получении трека");
            }
        }
        
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }
   
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
        [Authorize]
        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikeTrack(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favoritePlaylist = await _dbContext.Playlists
                .FirstOrDefaultAsync(p => p.IDUser == userId && p.PlaylistName == "Избранное");

            if (favoritePlaylist == null)
            {
                favoritePlaylist = new Playlist
                {
                    PlaylistName = "Избранное",
                    IDUser = userId
                };
                _dbContext.Playlists.Add(favoritePlaylist);
                await _dbContext.SaveChangesAsync();
            }

            var existing = await _dbContext.PlaylistsList
                .FirstOrDefaultAsync(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist && ps.IDSong == id);

            if (existing != null)
            {
                _dbContext.PlaylistsList.Remove(existing);
                await _dbContext.SaveChangesAsync();
                return Ok(new { liked = false });
            }

            var maxPosition = await _dbContext.PlaylistsList
                .Where(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist)
                .MaxAsync(ps => (int?)ps.Position) ?? 0;

            _dbContext.PlaylistsList.Add(new PlaylistList
            {
                IDPlaylist = favoritePlaylist.IDPlaylist,
                IDSong = id,
                Position = maxPosition + 1
            });
            await _dbContext.SaveChangesAsync();

            return Ok(new { liked = true });
        }

        [Authorize]
        [HttpGet("{id}/like-status")]
        public async Task<IActionResult> GetLikeStatus(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favoritePlaylist = await _dbContext.Playlists
                .FirstOrDefaultAsync(p => p.IDUser == userId && p.PlaylistName == "Избранное");

            if (favoritePlaylist == null)
                return Ok(new { liked = false });

            var exists = await _dbContext.PlaylistsList
                .AnyAsync(ps => ps.IDPlaylist == favoritePlaylist.IDPlaylist && ps.IDSong == id);

            return Ok(new { liked = exists });
        }
    }
}

