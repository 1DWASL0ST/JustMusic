namespace backendAPI.DTO
{
    public class AlbumUpload
    {
        public required int IDAlbum { get; set; }
        public required IFormFile PictureFile { get; set; }
    }
}
