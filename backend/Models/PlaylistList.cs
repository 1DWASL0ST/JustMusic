using backendAPI.User;

public class PlaylistList
{
    public int playlistId {  get; set; }
    public int userId {  get; set; }
    public int position {  get; set; }
    public int trackId {  get; set; }
    public Playlist? Playlist { get; set; }
    public User? User { get; set; }
    public Track? Track { get; set; }
}
