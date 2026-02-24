public class Playlist
{
    public int id { get; set; }
    public string name { get; set; } = "playlist";
    public int userId { get; set; }
    public User? User { get; set; }
}
