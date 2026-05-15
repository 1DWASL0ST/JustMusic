import { useState, useEffect } from 'react';
import '../styles/artistStats.css';

function ArtistStats() {
    const [loading, setLoading] = useState(true);
    const [artistsStats, setArtistsStats] = useState([]);
    const [tracksPerAlbum, setTracksPerAlbum] = useState([]);

    useEffect(() => {
        loadAllArtistsStats();
    }, []);

    const loadAllArtistsStats = async () => {
        try {
            const response = await fetch('/api/Artist/stats');
            const data = await response.json();

            setArtistsStats(data.stats || []);
            setTracksPerAlbum(data.tracksPerAlbum || []);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="stats-loading">Загрузка...</div>;
    if (artistsStats.length === 0) return <div>Нет данных</div>;

    const maxTracks = Math.max(...artistsStats.map(a => a.tracksCount), 1);
    const maxAlbums = Math.max(...artistsStats.map(a => a.albumsCount), 1);
    const maxAlbumTracks = Math.max(...tracksPerAlbum.map(a => a.tracksCount), 1);

    return (
        <div className="artist-stats">
            <h3>Статистика по исполнителям</h3>

            <div className="stats-table">
                <div className="stats-header">
                    <span>Исполнитель</span>
                    <span>Треки</span>
                    <span>Альбомы</span>
                </div>

                {artistsStats.map(artist => (
                    <div key={artist.artistId} className="stats-row">
                        <span className="artist-name">{artist.artistName}</span>

                        <div className="bar-container">
                            <div
                                className="bar bar-tracks"
                                style={{ width: `${(artist.tracksCount / maxTracks) * 100}%` }}
                            >
                                <span className="bar-label">{artist.tracksCount}</span>
                            </div>
                        </div>

                        <div className="bar-container">
                            <div
                                className="bar bar-albums"
                                style={{ width: `${(artist.albumsCount / maxAlbums) * 100}%` }}
                            >
                                <span className="bar-label">{artist.albumsCount}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {tracksPerAlbum.length > 0 && (
                <div className="tracks-per-album">
                    <h3>Треки по альбомам</h3>
                    <div className="album-bars">
                        {tracksPerAlbum.map((album, idx) => (
                            <div key={idx} className="album-bar-item">
                                <span className="album-name">{album.albumName}</span>
                                <div className="bar-container">
                                    <div
                                        className="bar bar-album-tracks"
                                        style={{ width: `${(album.tracksCount / maxAlbumTracks) * 100}%` }}
                                    >
                                        <span className="bar-label">{album.tracksCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArtistStats;