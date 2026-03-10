namespace backendAPI.DTO
{
    public class AlbumCommon
    {
        public required string AlbumName { get; set; }
        public required string AlbumPicture { get; set; } = "images/AlbumCommon.png";
        public int IDArtist {  get; set; }
    }
}
