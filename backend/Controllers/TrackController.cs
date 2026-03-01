using Microsoft.AspNetCore.Mvc;
using backendAPI.Data;
using Microsoft.EntityFrameworkCore;
namespace backendAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TrackController : ControllerBase
    {

        private readonly ILogger<TrackController> _logger;
        private readonly DataDbContext _dbContext;

        public TrackController(DataDbContext context, ILogger<TrackController> logger)
        {
            _dbContext = context;
            _logger = logger;
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

        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
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
