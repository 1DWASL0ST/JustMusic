public class Album
{
    public int IDAlbum {  get; set; }
    public string AlbumName { get; set; } = "Name";
    public  int IDArtist { get; set; }
    public string AlbumPicture { get; set; } = "images/AlbumCommon.png"; 
    public Artist? artist { get; set; }

}
