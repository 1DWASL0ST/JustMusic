public class Playlist
{
    public int IDPlaylist { get; set; }
    public string PlaylistName { get; set; } = "playlist";
    public int IDUser { get; set; }
    public User? User { get; set; }

    public PlaylistList ? playlistList { get; set; }
}
