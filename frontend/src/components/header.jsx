import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlaylist } from '../hooks/usePlaylists.js';
import PlaylistsModal from '../pages/PlaylistModal.jsx';
import { useAudio } from '../context/audioContext.jsx';
import '../styles/global.css';

function Header() {
    const { handlePlayPlaylist } = useAudio();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const { isPlaylistsModalOpen, setIsPlaylistsModalOpen, togglePlaylistsClick } = usePlaylist(true);
    return (
        <>
            <PlaylistsModal
            isOpen={isPlaylistsModalOpen}
            onClose={() => setIsPlaylistsModalOpen(false)}
            onSelectPlaylist={(playlist) => console.log('Выбран плейлист:', playlist)}
            onPlayPlaylist={handlePlayPlaylist}
            />
            <div className='mainHeader'>
                <h1 onClick={() => navigate('/')}>Только Музыка</h1>
                {!isAuthenticated ?
                    (
                        <>
                            <button onClick={() => navigate('/login')}>Войти</button>
                            <button style={{ background: 'none', border: '1px solid black', color: '#251f1f' }} onClick={() => navigate('/register')}>Регистрация</button>
                        </>
                    )
                    : (
                        <>
                            <button onClick={togglePlaylistsClick}>Плейлисты</button>
                            <button onClick={() => navigate('/profile', '_blank')}>Профиль</button>
                            <button onClick={logout} style={{ background: 'none', border: '1px solid black', color: '#251f1f' }}>
                                Выйти
                            </button>
                        </>
                    )}
            </div>
        </>
    );
}

export default Header;