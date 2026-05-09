using backendAPI.DTO;

namespace backendAPI.Models
{
    public class Search
    {
        public List<TrackInfo> Tracks { get; set; } = new List<TrackInfo>();
        public List<AlbumSearch> Albums { get; set; } = new List<AlbumSearch>();
        public List<ArtistInfo> Artists { get; set; } = new List<ArtistInfo>();
    }
}
