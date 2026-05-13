using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backendAPI.Data;
using backendAPI.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Album>> PostAlbum(AlbumPost request)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isAdmin = await _dbcontext.Admins.AnyAsync(a => a.UserId == currentUserId);
            if (!isAdmin)
            {
                return Unauthorized("Недостаточно прав");
            }

            else
            {
                Album album = new Album
                {
                    IDArtist = request.IDArtist,
                    AlbumName = request.AlbumName
                };
                _dbcontext.Albums.Add(album);
                await _dbcontext.SaveChangesAsync();

                return CreatedAtAction("GetAlbum", new { id = album.IDAlbum }, album);
            }
        }

        // DELETE: api/Album/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlbum(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isAdmin = await _dbcontext.Admins.AnyAsync(a => a.UserId == currentUserId);
            if (!isAdmin)
            {
                return Unauthorized("Недостаточно прав");
            }

            else
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
                
        }


        [HttpGet("{id}/tracks")]
        public async Task<ActionResult<IEnumerable<Track>>> GetAkbumTracks(int id)
        {

            var album = await _dbcontext.Albums
                .FirstOrDefaultAsync(album => album.IDAlbum == id);

            if (album == null)
                return NotFound();

            var tracks = await _dbcontext.Tracks
                .Where(track => track.IDAlbum == id)
                .Select(track=> new TrackCommon
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

        private bool AlbumExists(int id)
        {
            return _dbcontext.Albums.Any(e => e.IDAlbum == id);
        }
    }
}
