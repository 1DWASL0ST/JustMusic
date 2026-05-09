namespace backendAPI.DTO
{
    public class TrackCommon
    {
        public required int IDSong { get; set; }
        public required string TrackName { get; set; }
        public required int IDArtist { get; set; }
        public required int IDAlbum { get; set; }
        public required string PathSong { get; set; } 
        public ArtistInfo? Artist { get; set; }
        public AlbumInfo? Album { get; set; }
    }
}