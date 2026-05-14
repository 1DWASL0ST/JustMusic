using Microsoft.EntityFrameworkCore;
using backendAPI.Models;

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
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Admin> Admins {  get; set; }

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
                .HasForeignKey(track => track.IDArtist)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Track>()
                .HasOne(track => track.album)
                .WithMany()
                .HasForeignKey(track => track.IDAlbum)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Album>()
                .HasKey(album => album.IDAlbum);

            modelBuilder.Entity<Album>()
                .HasOne(album => album.artist)
                .WithMany()
                .HasForeignKey(album => album.IDArtist)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Playlist>()
                .HasOne(playlist => playlist.User)
                .WithMany()
                .HasForeignKey(playlist => playlist.IDUser);
            
            modelBuilder.Entity<Playlist>()
                .HasKey(playlist => playlist.IDPlaylist);

            modelBuilder.Entity<PlaylistList>()
                .HasOne(pll => pll.Playlist)
                .WithMany()
                .HasForeignKey(pll => pll.IDPlaylist)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlaylistList>()
                .HasOne(pll => pll.Track)
                .WithMany()
                .HasForeignKey(pll => pll.IDSong)
                .OnDelete(DeleteBehavior.Cascade);
           
            modelBuilder.Entity<PlaylistList>()
                .HasKey(pll => new { pll.IDPlaylist, pll.IDSong });

            modelBuilder.Entity<RefreshToken>()
                .HasKey(refreshtoken => refreshtoken.ID);
           
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(refreshtoken => refreshtoken.Token).IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(refreshtoken => refreshtoken.IDUser);


            modelBuilder.Entity<RefreshToken>()
                .HasOne(refreshtoken => refreshtoken.User)
                .WithMany()
                .HasForeignKey(refreshtoken => refreshtoken.IDUser)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Admin>()
                .HasKey(admin => admin.Id);

            modelBuilder.Entity<Admin>()
                .HasOne(admin => admin.user)
                .WithOne()
                .HasForeignKey<Admin>(admin => admin.UserId);
            
            modelBuilder.Entity<Album>()
                .Property(a => a.AlbumPicture)
                .HasComputedColumnSql("('picture' || \"IDAlbum\" || '.png')");

            modelBuilder.Entity<Track>()
               .Property(t => t.PathSong)
               .HasComputedColumnSql("('track' || \"IDSong\" || '.mp3')");


            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Album>().ToTable("Albums");
            modelBuilder.Entity<Playlist>().ToTable("Playlists");
            modelBuilder.Entity<PlaylistList>().ToTable("PlaylistSongs");
            modelBuilder.Entity<Artist>().ToTable("Artists");
            modelBuilder.Entity<Track>().ToTable("Tracks");
            modelBuilder.Entity<RefreshToken>().ToTable("RefreshTokens");
            modelBuilder.Entity<Admin>().ToTable("Admins");
        }
    }
}
