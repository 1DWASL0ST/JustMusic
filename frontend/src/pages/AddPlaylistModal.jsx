import { useState, useEffect } from 'react';
import { authFetch } from '../api/api.js';
import playlistIcon from '../components/images/playlistIcon.svg';
import addIcon from '../components/buttons/addPlaylist.svg';
import '../styles/addPlaylistModal.css'

function AddPlaylistModal({ isOpen, onClose, trackId, onTrackAdded }) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

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
            setPlaylists(data.filter(p => p.playlistName !== "Избранное"));
        } catch (error) {
            console.error('Ошибка загрузки плейлистов:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToPlaylist = async (playlistId) => {
        try {
            const response = await authFetch(`/api/Playlists/${playlistId}/tracks/${trackId}`, {
                method: 'POST'
            });
            if (response.ok) {
                onTrackAdded?.();
                onClose();
            }
        } catch (error) {
            console.error('Ошибка добавления:', error);
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Добавить в плейлист</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div style={{ color:'#EF14F3'}}>Загрузка...</div>
                    ) : (
                        <>
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.idPlaylist}
                                    className="playlists-item"
                                    onClick={() => addToPlaylist(playlist.idPlaylist)}
                                >
                                    <img src={playlistIcon} alt="playlist" />
                                    <span>{playlist.playlistName}</span>
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
                                            fontSize: 'clamp(0.75rem, 1.5vw, 1rem)',
                                            justifyContent: 'space-around'
                                        }}
                                    />
                                        <div style={{ display: 'flex', gap: '1vw', paddingRight: '3vw', justifyContent: 'space-around' }}>
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
                                <button onClick={() => setShowCreateForm(true)} style={{
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
                                            }}>
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
export default AddPlaylistModal;