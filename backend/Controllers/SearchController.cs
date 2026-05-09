using Microsoft.AspNetCore.Mvc;
using backendAPI.DTO;
using backendAPI.Data;
using backendAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace backendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly DataDbContext _dbcontext;

        public SearchController (DataDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        [HttpGet]
        public async Task<ActionResult<Search>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new Search());
            }

            var tracks = await _dbcontext.Tracks
                .Where(t => EF.Functions.ILike(t.TrackName, $"%{query}%"))
                .Take(20)
                .Select(t => new TrackInfo
                {
                    IDSong = t.IDSong,
                    TrackName = t.TrackName,
                    IDArtist = t.IDArtist,
                    ArtistName = t.artist!.ArtistName
                })
            .ToListAsync();

            var artists = await _dbcontext.Artists
                .Where(a => EF.Functions.ILike(a.ArtistName, $"%{query}%"))
                .Take(20)
                .Select(a => new ArtistInfo
                {
                    IDArtist = a.IDArtist,
                    ArtistName = a.ArtistName
                })
            .ToListAsync();

            var albums = await _dbcontext.Albums
                .Where(a => EF.Functions.ILike(a.AlbumName, $"%{query}%"))
                .Take(20)
                .Select(a => new AlbumSearch
                {
                    IDAlbum = a.IDAlbum,
                    AlbumName = a.AlbumName,
                    IDArtist = a.IDArtist,
                    ArtistName = a.artist!.ArtistName
                })
                .ToListAsync();

            return Ok(new Search
            {
                Tracks = tracks,
                Artists = artists,
                Albums = albums
            });
        }
    }
}
