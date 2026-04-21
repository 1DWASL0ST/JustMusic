import { useState, useEffect } from 'react';
import { authFetch } from '../api/api.js';
import playlistIcon from '../components/images/playlistIcon.svg';
import playIcon from '../components/buttons/play.svg';
import '../styles/playlistModal.css';

function PlaylistModal({ isOpen, onClose, onSelectPlaylist }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredPlaylist, setHoveredPlaylist] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadPlaylists();
        }
    }, [isOpen]);

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const response = await authFetch('/api/Playlists');
            const data = await response.json();
            setPlaylists(data);
        } catch (error) {
            console.error('Ошибка загрузки плейлистов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistClick = (playlist) => {
        // Переход на страницу плейлиста (в разработке)
        // navigate(`/playlist/${playlist.id}`);
        console.log('Переход на страницу плейлиста:', playlist.playlistName);
    };

    const handlePlayClick = (e, playlist) => {
        e.stopPropagation(); // Чтобы не сработал переход на страницу
        onSelectPlaylist(playlist);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="playlists-modal-overlay" onClick={onClose}>
            <div className="playlists-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="playlists-modal-header">
                    <h2>Мои плейлисты</h2>
                    <button className="playlists-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="playlists-modal-body">
                    {loading ? (
                        <div className="playlists-loading">Загрузка...</div>
                    ) : playlists.length === 0 ? (
                        <div className="playlists-empty">Нет плейлистов</div>
                    ) : (
                        playlists.map(playlist => (
                            <div
                                key={playlist.idPlaylist}
                                className="playlists-item"
                                onMouseEnter={() => setHoveredPlaylist(playlist.idPlaylist)}
                                onMouseLeave={() => setHoveredPlaylist(null)}
                            >
                                <div
                                    className="playlists-item-info"
                                    onClick={() => handlePlaylistClick(playlist)}
                                >
                                    <img src={playlistIcon} alt="playlist" className="playlists-item-icon" />
                                    <span className="playlists-item-name">{playlist.playlistName}</span>
                                </div>

                                {hoveredPlaylist === playlist.idPlaylist && (
                                    <button
                                        className="playlists-play-btn"
                                        onClick={(e) => handlePlayClick(e, playlist)}
                                    >
                                        <img src={playIcon} alt="play" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaylistModal;