using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using backendAPI.DTO;

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistController : ControllerBase
    {
        private readonly DataDbContext _dbcontext;

        public ArtistController(DataDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        // GET: api/Artist
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Artist>>> GetArtists()
        {
            return await _dbcontext.Artists.ToListAsync();
        }

        // GET: api/Artist/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Artist>> GetArtist(int id)
        {
            var artist = await _dbcontext.Artists.FindAsync(id);

            if (!ArtistExists(id))
            {
                return NotFound();
            }

            return artist;
        }

        [HttpGet("{id}/tracks")]
        public async Task<ActionResult<Artist>> GetArtistTracks(int id)
        {
            var artist = await _dbcontext.Artists.FindAsync(id);

            if (!ArtistExists(id))
            {
                return NotFound();
            }
            var tracks = await _dbcontext.Tracks
                .Where(track => track.IDArtist == id)
                .Select(track => new TrackCommon
                {
                    IDSong = track!.IDSong,
                    TrackName = track.TrackName,
                    IDArtist = track.IDArtist,
                    IDAlbum = track.IDAlbum,
                    PathSong = track.PathSong,
                    Artist = new ArtistInfo
                    {
                        ArtistName = track!.artist!.ArtistName
                    },
                    Album = new AlbumInfo
                    {
                        AlbumName = track!.album!.AlbumName,
                        AlbumPicture = track!.album!.AlbumPicture
                    }
                })
                .ToListAsync();
            return Ok(tracks);
        }

        [HttpGet("{id}/albums")]
        public async Task<ActionResult<Artist>> GetArtistAlbums(int id)
        {
            var artist = await _dbcontext.Artists.FindAsync(id);

            if (!ArtistExists(id))
            {
                return NotFound();
            }
            var albums = await _dbcontext.Albums
                .Where(album => album.IDArtist == id)
                .Select(album => new AlbumDetail
                {
                    IDAlbum = album!.IDAlbum,
                    AlbumPicture = album!.AlbumPicture,
                    AlbumName = album!.AlbumName,
                    artist = new ArtistInfo
                    {
                        ArtistName = album!.artist!.ArtistName
                    }
                })
                .ToListAsync();
            return Ok(albums);
        }
        // PUT: api/Artist/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArtist(int id, ArtistCommon ac)
        {
            if (!ArtistExists(id))
            {
                return BadRequest();
            }
           
            Artist artist = await _dbcontext.Artists.FindAsync(id);
            
            if(string.IsNullOrEmpty(ac.ArtistName) || string.IsNullOrEmpty(ac.ArtistDef))
            {
                return BadRequest();
            }

            artist.ArtistName = ac.ArtistName;
            artist.ArtistDef = ac.ArtistDef;
            

            try
            {
                await _dbcontext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, new { message = "Не удалось обновить исполнителя" });
            }

            return Ok(new {message = "Данные исполнителя изменены"});
        }

        // POST: api/Artist
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Artist>> PostArtist([FromBody]ArtistCommon ac)
        {
            Artist artist = new Artist
            {
                ArtistName = ac.ArtistName,
                ArtistDef = ac.ArtistDef
            };

            _dbcontext.Artists.Add(artist);
            await _dbcontext.SaveChangesAsync();

            return CreatedAtAction("GetArtist", new { id = artist.IDArtist }, artist);
        }

        // DELETE: api/Artist/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArtist(int id)
        {
            var artist = await _dbcontext.Artists.FindAsync(id);
            if (!ArtistExists(id))
            {
                return NotFound();
            }

            _dbcontext.Artists.Remove(artist);
            await _dbcontext.SaveChangesAsync();

            return Ok(new {message = "Исполнитель {ArtistName} удален", ArtistName = artist.ArtistName});
        }

        private bool ArtistExists(int id)
        {
            return _dbcontext.Artists.Any(e => e.IDArtist == id);
        }
    }
}
