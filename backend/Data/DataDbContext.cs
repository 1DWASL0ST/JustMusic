using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;

namespace backendAPI.Data
{
    public class DataDbContext : DbContext
    {
        public DataDbContext(DbContextOptions<DataDbContext> options) : base(options) 
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<Album> Albums { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<PlaylistList> PlaylistsList { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasKey(user => user.IDUser);
            
            modelBuilder.Entity<Artist>()
                .HasKey(artist => artist.IDArtist);

            modelBuilder.Entity<Track>()
                .HasKey(track => track.IDSong);

            modelBuilder.Entity<Track>()
                .HasOne(track => track.artist)
                .WithMany()
                .HasForeignKey(track => track.IDArtist);
           
            modelBuilder.Entity<Track>()
                .HasOne(track => track.album)
                .WithMany()
                .HasForeignKey(track => track.IDAlbum);

            modelBuilder.Entity<Album>()
                .HasKey(album => album.IDAlbum);

            modelBuilder.Entity<Album>()
                .HasOne(album => album.artist)
                .WithMany()
                .HasForeignKey(album => album.IDArtist);

            modelBuilder.Entity<Playlist>()
                .HasOne(playlist => playlist.User)
                .WithMany()
                .HasForeignKey(playlist => playlist.IDUser);
            
            modelBuilder.Entity<Playlist>()
                .HasKey(playlist => playlist.IDPlaylist);

            modelBuilder.Entity<PlaylistList>()
                .HasOne(pll => pll.Playlist)
                .WithOne(playlist => playlist.playlistList)
                .HasForeignKey<PlaylistList>(pll => pll.IDPlaylist)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlaylistList>()
                .HasOne(pll => pll.Track)
                .WithMany()
                .HasForeignKey(pll => pll.IDSong)
                .OnDelete(DeleteBehavior.Cascade);
           
            modelBuilder.Entity<PlaylistList>()
                .HasKey(pll => new { pll.IDPlaylist });

            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Album>().ToTable("Albums");
            modelBuilder.Entity<Playlist>().ToTable("Playlists");
            modelBuilder.Entity<PlaylistList>().ToTable("PlaylistSongs");
            modelBuilder.Entity<Artist>().ToTable("Artists");
            modelBuilder.Entity<Track>().ToTable("Tracks");
        }
    }
}
