public class Album
{
    public int id {  get; set; }
    public string name { get; set; } = "Name";
    public int artistId { get; set; }
    public string AlbumPicture { get; set; } = "img.png";
    public Artist? Artist { get; set; }

}
