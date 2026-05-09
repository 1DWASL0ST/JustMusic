namespace backendAPI.DTO
{
    public class AlbumDetail
    {
        public required int IDAlbum { get; set; }
        public required string AlbumName { get; set; } = string.Empty;
        public required string? AlbumPicture { get; set; }
        public ArtistInfo? artist { get; set; }
        public List<TrackInfo> tracks { get; set; } = new();
    }
}