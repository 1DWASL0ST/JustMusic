namespace backendAPI.DTO
{
    public class TrackSearch
    {
        public int IDSong { get; set; }
        public required string TrackName { get; set; }
        public required int IDArtist { get; set; }
        public required string ArtistName { get; set; }
    }
}
