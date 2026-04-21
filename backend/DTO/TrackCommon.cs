using backendAPI.DTO;

public class TrackCommon
{
    public required int IDSong { get; set; }
    public required string TrackName { get; set; }
    public required int IDArtist { get; set; }
    public required int IDAlbum { get; set; }
    public required string PathSong { get; set; } 
    public ArtistCommon? Artist { get; set; }
    public AlbumCommon? Album { get; set; }
}
