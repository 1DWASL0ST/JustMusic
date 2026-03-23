using Microsoft.AspNetCore.Mvc;
using backendAPI.Data;
using Microsoft.EntityFrameworkCore;
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
    }
}
