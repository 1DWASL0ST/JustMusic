import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlaylist } from '../hooks/usePlaylists.js';
import PlaylistsModal from '../pages/PlaylistModal.jsx';
import { useAudio } from '../context/audioContext.jsx';
import playAllTracksIcon from '../components/buttons/playAllTracks.svg';
import '../styles/global.css';
import { useAdmin } from '../hooks/useAdmin';

function Header() {
    const { handlePlayPlaylist, resetToAllTracks } = useAudio();
    const navigate = useNavigate();
    const { isAdmin, loading } = useAdmin();
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
                            <button style={{ backgroundImage: `url(${playAllTracksIcon})`, aspectRatio: '5.865', width: '16.34vw', backgroundColor: 'transparent' }} onClick={() => resetToAllTracks()}></button>
                            <button onClick={togglePlaylistsClick}>Плейлисты</button>
                            <button onClick={() => navigate('/profile', '_blank')}>Профиль</button>
                            <button onClick={logout} style={{ background: 'none', border: '1px solid black', color: '#251f1f' }}>
                                Выйти
                            </button>
                        </>
                    )}
                {isAuthenticated && !loading && isAdmin && (
                    <button onClick={() => navigate('/admin')}>Админ панель</button>
                )}
            </div>
        </>
    );
}

export default Header;