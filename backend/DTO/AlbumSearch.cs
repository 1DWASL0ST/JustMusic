namespace backendAPI.DTO
{
    public class AlbumSearch
    {
        public int IDAlbum {  get; set; }
        public required string AlbumName {  get; set; }
        public required int IDArtist {  get; set; }
        public required string ArtistName {  get; set; }
    }
}
