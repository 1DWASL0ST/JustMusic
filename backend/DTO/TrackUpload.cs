namespace backendAPI.DTO
{
    public class TrackUpload
    {
        public required int IDSong { get; set; }
        public required IFormFile AudioFile { get; set; }
    }
}
