using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TrackController : ControllerBase
    {

        private readonly ILogger<TrackController> _logger;

        public TrackController(ILogger<TrackController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetAllTracks")]
        public IEnumerable<Track> Get()
        {
            var testArtist = new Artist { id = 0, name = "Artist" };
            var testAlbum = new Album { id = 0, artistId = testArtist.id, artist = testArtist, name = "Album"};
            return Enumerable.Range(1, 5).Select(index => new Track
            {
                id = Random.Shared.Next(0, 100),
                artist = testArtist,
                album = testAlbum,
                albumID = testAlbum.id,
            }
            ).ToArray();
        }
    }
}
