import { useState, useEffect } from 'react';
import { authFetch } from '../api/api.js';
import playlistIcon from '../components/images/playlistIcon.svg';
import playIcon from '../components/buttons/play.svg';
import '../styles/playlistModal.css';

function PlaylistModal({ isOpen, onClose, onSelectPlaylist, onPlayPlaylist }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hoveredPlaylist, setHoveredPlaylist] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');


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

    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            const response = await authFetch('/api/Playlists', {
                method: 'POST',
                body: JSON.stringify({ playlistName: newPlaylistName })
            });
            if (response.ok) {
                setNewPlaylistName('');
                setShowCreateForm(false);
                await loadPlaylists();
            }
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const handlePlaylistClick = (playlist) => {
        // Переход на страницу плейлиста (в разработке)
        // navigate(`/playlist/${playlist.id}`);
        console.log('Переход на страницу плейлиста:', playlist.playlistName);
    };

    const handlePlayClick = (e, playlist) => {
        e.stopPropagation(); // Чтобы не сработал переход на страницу
        if (onPlayPlaylist) {
            onPlayPlaylist(playlist);  // ← вызываем отдельную функцию для воспроизведения
        }
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

                <div className="modal-body">
                    {loading ? (
                        <div className="playlists-loading">Загрузка...</div>
                    ) : (
                        <>
                            {playlists.map(playlist => (
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
                                        <span className="playlist-name">{playlist.playlistName}</span>
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
                            ))}
                            {showCreateForm ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh', marginTop: '1.5vh', padding: '1.5vh 1vw' }}>
                                    <input
                                        type="text"
                                        placeholder="Название"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        style={{
                                            padding: '1.2vh 1.5vw',
                                            background: '#000000',
                                            border: '0.13vh solid #EF14F3',
                                            borderRadius: '2.6vw',
                                            color: '#EF14F3',
                                            fontFamily: 'Ubuntu',
                                            fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '1vw', justifyContent: 'space-around' }}>
                                        <button
                                            onClick={createPlaylist}
                                            style={{
                                                padding: '1vh 1.5vw',
                                                background: '#EF14F3',
                                                border: 'none',
                                                borderRadius: '20px',
                                                color: '#000000',
                                                fontFamily: 'Ubuntu',
                                                fontSize: '1.5vw',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Создать
                                        </button>
                                        <button
                                            onClick={() => setShowCreateForm(false)}
                                            style={{
                                                padding: '1vh 1.5vw',
                                                background: '#EF14F3',
                                                border: 'none',
                                                borderRadius: '20px',
                                                color: '#000000',
                                                fontFamily: 'Ubuntu',
                                                fontSize: '1.5vw',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    style={{
                                        width: '100%',
                                        padding: '1.5vh',
                                        background: 'none',
                                        border: '1px dashed #EF14F3',
                                        borderRadius: '20px',
                                        color: '#EF14F3',
                                        fontFamily: 'Ubuntu',
                                        fontSize: '1.5vw',
                                        cursor: 'pointer',
                                        marginTop: '1.5vh'
                                    }}
                                >
                                    Новый плейлист
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlaylistModal;