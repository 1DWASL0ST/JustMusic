public class PlaylistList
{
    public int IDPlaylist {  get; set; }
    public int userId {  get; set; }
    public int IDSong {  get; set; }
    public Playlist? Playlist { get; set; }
    public Track? Track { get; set; }
}
