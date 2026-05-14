using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using System.Security.Claims;
using backendAPI.DTO;
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
                    .Include(track => track.album)
                    .ToListAsync();

                return Ok(tracks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка треков");
                return StatusCode(500, "Треки не найдены");
            }
        }
        public async Task<ActionResult<AlbumDetail>> GetTrack(int id)
        {
            Track track = await _dbContext.Tracks.FindAsync(id);
            Artist artist = await _dbContext.Artists.FindAsync(track.IDArtist);
            Album album = await _dbContext.Albums.FindAsync(track.IDAlbum);

            if (album == null)
            {
                return NotFound();
            }

            return Ok(track);
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

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Track>> PostTrack([FromBody] TrackPost request)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isAdmin = await _dbContext.Admins.AnyAsync(a => a.UserId == currentUserId);
            if (!isAdmin)
            {
                return Unauthorized("Недостаточно прав");
            }

            else
            {
                Track track = new Track
                {
                    TrackName = request.TrackName,
                    IDAlbum = request.IDAlbum,
                    IDArtist = request.IDArtist,
                };

                _dbContext.Tracks.Add(track);
                await _dbContext.SaveChangesAsync();

                return CreatedAtAction("GetTrack", new { id = track.IDSong }, track);
            }
        }

        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }
        
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrack(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isAdmin = await _dbContext.Admins.AnyAsync(a => a.UserId == currentUserId);
            if (!isAdmin)
            {
                return Unauthorized("Недостаточно прав");
            }

            else
            {
                var track = await _dbContext.Tracks.FindAsync(id);

                _dbContext.Tracks.Remove(track);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Трек удален" });
            }
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

        [Authorize]
        [HttpPost("upload/track")]
        public async Task<IActionResult> UploadTrack([FromForm] TrackUpload model)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isAdmin = await _dbContext.Admins.AnyAsync(a => a.UserId == currentUserId);
            if (!isAdmin)
            {
                return Unauthorized("Недостаточно прав");
            }

            else
            {
                if (model.AudioFile == null || model.AudioFile.Length == 0)
                    return BadRequest("Файл не выбран");

                var uploadPath = "/app/tracks";
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                string fileName = $"track{model.IDSong}.mp3";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.AudioFile.CopyToAsync(stream);
                }

                return Ok();
            }
        }
    }
}

