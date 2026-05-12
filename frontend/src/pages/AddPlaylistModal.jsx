import { useEffect } from 'react';
import playlistIcon from '../components/images/playlistIcon.svg';
import '../styles/addPlaylistModal.css'
import { usePlaylist } from '../hooks/usePlaylists';

function AddPlaylistModal({ isOpen, onClose, trackId}) {
    const { loadPlaylists,
        errorMessage,
        loading,
        playlists,
        addToPlaylist,
        showCreateForm,
        newPlaylistName,
        setNewPlaylistName,
        createPlaylist,
        setShowCreateForm } = usePlaylist({ onClose });

    useEffect(() => {
        if (isOpen) {
            loadPlaylists();
        }
    }, [isOpen]);




    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Добавить в плейлист</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="modal-body">
                    {loading ? (
                        <div style={{ color:'#EF14F3'}}>Загрузка...</div>
                    ) : (
                        <>
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.idPlaylist}
                                    className="playlists-item"
                                    onClick={() => addToPlaylist(playlist.idPlaylist, trackId, false)}
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