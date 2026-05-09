using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using backendAPI.DTO;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlbumController : ControllerBase
    {
        private readonly DataDbContext _dbcontext;

        public AlbumController(DataDbContext context)
        {
            _dbcontext = context;
        }

        // GET: api/Album
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Album>>> GetAlbums()
        {
            return await _dbcontext.Albums.ToListAsync();
        }

        // GET: api/Album/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AlbumDetail>> GetAlbum(int id)
        {
            Album album = await _dbcontext.Albums.FindAsync(id);
            Artist artist = await _dbcontext.Artists.FindAsync(album.IDArtist);
            List<Track> trackList = await _dbcontext.Tracks.Where(track => track.IDAlbum == id).ToListAsync();

            if (album == null)
            {
                return NotFound();
            }
                

            var albumDto = new AlbumDetail
            {
                IDAlbum = album.IDAlbum,
                AlbumName = album.AlbumName,
                AlbumPicture = album.AlbumPicture,
                artist = new ArtistInfo
                {
                    IDArtist = artist.IDArtist,
                    ArtistName = artist.ArtistName
                },
                tracks = trackList.Select(track => new TrackInfo
                {
                    IDSong = track.IDSong,
                    TrackName = track.TrackName,
                    IDArtist = artist.IDArtist,
                    ArtistName = artist.ArtistName
                }).ToList()
            };

            return Ok(albumDto);
        }

        // PUT: api/Album/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlbum(int id, Album album)
        {
            if (id != album.IDAlbum)
            {
                return BadRequest();
            }

            _dbcontext.Entry(album).State = EntityState.Modified;

            try
            {
                await _dbcontext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlbumExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Album
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Album>> PostAlbum(Album album)
        {
            _dbcontext.Albums.Add(album);
            await _dbcontext.SaveChangesAsync();

            return CreatedAtAction("GetAlbum", new { id = album.IDAlbum }, album);
        }

        // DELETE: api/Album/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlbum(int id)
        {
            var album = await _dbcontext.Albums.FindAsync(id);
            if (album == null)
            {
                return NotFound();
            }

            _dbcontext.Albums.Remove(album);
            await _dbcontext.SaveChangesAsync();

            return NoContent();
        }

        private bool AlbumExists(int id)
        {
            return _dbcontext.Albums.Any(e => e.IDAlbum == id);
        }
    }
}
