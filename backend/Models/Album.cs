public class Album
{
    public required int IDAlbum {  get; set; }
    public string AlbumName { get; set; } = "Name";
    public required int IDArtist { get; set; }
    public string AbumPicture { get; set; } = "img.png"; //ПЕРЕИМЕНУЙ КОЛОНКУ ХРИСТОМ БОГОМ МОЛЮ
    public Artist? artist { get; set; }

}
