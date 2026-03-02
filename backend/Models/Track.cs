public class Track
{
    public int IDSong {  get; set; }
    public string PathSong { get; set; } = "song.mp3";
    public string TrackName { get; set; } = "Song";
    public int IDArtist { get; set; }
    public required int IDAlbum { get; set; }
    public Artist? artist { get; set; }
    public Album? album { get; set; }
}
