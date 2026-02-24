public class Track
{
    public required int id {  get; set; }
    public string path { get; set; } = "song.mp3";
    public string name { get; set; } = "Song";
    public int atristId { get; set; }
    public required int albumID { get; set; }
    public string albumName { get; set; } = "album";
    public Artist? artist { get; set; }
    public Album? album { get; set; }
}
