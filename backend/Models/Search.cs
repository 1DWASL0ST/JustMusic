using backendAPI.DTO;

namespace backendAPI.Models
{
    public class Search
    {
        public List<TrackSearch> Tracks { get; set; } = new List<TrackSearch>();
        public List<AlbumSearch> Albums { get; set; } = new List<AlbumSearch>();
        public List<ArtistSearch> Artists { get; set; } = new List<ArtistSearch>();
    }
}
