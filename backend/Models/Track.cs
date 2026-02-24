public class Track
{
    public int id {  get; set; }
    public string path { get; set; } = "song.mp3";
    public string name { get; set; } = "Song";
    public int atristId { get; set; }
    public string albumID { get; set; } = "album";
    public Artist? Artist { get; set; }
    public Album? Album { get; set; }
}
