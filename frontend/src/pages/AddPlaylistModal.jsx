import { useState, useEffect } from 'react';
import { authFetch } from '../api';
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
                body: JSON.stringify({ name: newPlaylistName })
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
                        <div>Загрузка...</div>
                    ) : (
                        <>
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.idPlaylist}
                                    className="playlist-item"
                                    onClick={() => addToPlaylist(playlist.idPlaylist)}
                                >
                                    <img src={playlistIcon} alt="playlist"/>
                                    <span>{playlist.playlistName}</span>
                                    <img src={addIcon} alt="plus" />
                                </div>
                            ))}

                            {showCreateForm ? (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Название"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                    />
                                    <button onClick={createPlaylist}>Создать</button>
                                    <button onClick={() => setShowCreateForm(false)}>Отмена</button>
                                </div>
                            ) : (
                                <button onClick={() => setShowCreateForm(true)}>
                                    + Новый плейлист
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