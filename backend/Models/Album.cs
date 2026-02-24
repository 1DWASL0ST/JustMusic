public class Album
{
    public required int id {  get; set; }
    public string name { get; set; } = "Name";
    public required int artistId { get; set; }
    public string AlbumPicture { get; set; } = "img.png";
    public Artist? artist { get; set; }

}
