import { useState, useEffect } from 'react';
import '../styles/global.css';
import nextIcon from '../components/buttons/next.svg';
import playIcon from '../components/buttons/play.svg';
import pauseIcon from '../components/buttons/pause.svg';
import addPlaylist from '../components/buttons/addPlaylist.svg'
import likeIcon from '../components/buttons/liked.svg'
import unlikeIcon from '../components/buttons/unliked.svg'
import shuffleIcon from '../components/buttons/shuffle.svg'
import shuffleOnIcon from '../components/buttons/shuffleOn.svg'
import repeatIcon from '../components/buttons/repeat.svg'
import repeatOnIcon from '../components/buttons/repeatQueue.svg'
import repeatTrackIcon from '../components/buttons/repeatTrack.svg'
import { useQueue } from '../hooks/useQueue.js';
import { useAudio } from '../context/audioContext.jsx';
import defaultCover from '../components/images/AlbumCommon.png';
import { useNavigate } from 'react-router-dom';
import AddPlaylistModal from '../pages/AddPlaylistModal.jsx';
import PlaylistsModal from '../pages/PlaylistModal.jsx';
import Queue from '../pages/Queue.jsx';
import Search from '../pages/searchPage.jsx';
import { authFetch } from '../api/api.js';

function MainPage() {
    const {
        setCurrentIndex,
        handlePlayPlaylist,
        isShuffle,
        toggleShuffle,
        queue,
        currentIndex,
        setCurrentTrack,
        currentTrack : queueTrack,
        repeatMode,
        toggleRepeat,
        nextTrack,
        prevTrack,
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        seekTo,
        playTrack,
    } = useAudio();

    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
    const [isPlaylistsModalOpen, setIsPlaylistsModalOpen] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const handleTrackSelect = (track) => {
        playTrack(track);
        setSearchMode(false);
    };

    const handleArtistSelect = (artist) => {
        setSearchMode(false);
    };

    const handleAlbumSelect = (album) => {
        setSearchMode(false);
    };

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setSearchMode(true);
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await authFetch(`/api/Track/${queueTrack?.idSong}/like`, {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
            }
        } catch (error) {
            console.error('Ошибка при лайке:', error);
        }
    };

    const handleAddToPlaylistClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsAddPlaylistModalOpen(true);
    };

    const handlePlaylistsClick = () => {
        setIsPlaylistsModalOpen(true);
    };

    useEffect(() => {
        if (queueTrack && isAuthenticated) {
            checkLikeStatus();
        }
    }, [queueTrack, isAuthenticated]);

    const checkLikeStatus = async () => {
        try {
            const response = await authFetch(`/api/Track/${queueTrack?.idSong}/like-status`);
            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.liked);
            }
        } catch (error) {
            console.error('Ошибка проверки лайка:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const name = payload.name || payload.unique_name;
                setUserName(name || 'User');
            } catch (e) {
                console.error('Ошибка парсинга токена', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        navigate('/login');
    };

    useEffect(() => {
        window.nextTrack = nextTrack;
        return () => {
            delete window.nextTrack;
        };
    }, [nextTrack, repeatMode]);

    const handleSelectTrackFromQueue = (track, index) => {
        setCurrentIndex(index);
        setCurrentTrack(track);
        playTrack(track);
    };


    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        const newTime = percent * duration;
        seekTo(newTime);
    };

    if (!queueTrack) {
        return (<div className="loading"><h1> </h1> <h1> </h1><h1>Музыка вот вот будет</h1></div>);
    }

    return (
        <>
            <AddPlaylistModal
                isOpen={isAddPlaylistModalOpen}
                onClose={() => setIsAddPlaylistModalOpen(false)}
                trackId={queueTrack?.idSong}
                onTrackAdded={() => setIsLiked(true)}
            />
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
                            <button onClick={handlePlaylistsClick}>Плейлисты</button>
                            <button onClick={() => navigate('/profile', '_blank')}>Профиль</button>
                            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid black', color: '#251f1f' }}>
                                Выйти
                            </button>
                        </>
                    )}
            </div>

            <div className='mainPart'>
                <Search
                    onTrackSelect={handleTrackSelect}
                    onArtistSelect={handleArtistSelect}
                    onAlbumSelect={handleAlbumSelect}
                />

                <div className='mainContent'>
                    <div className='mainPlayer'>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={prevTrack}>
                            <img src={nextIcon} style={{ width: '80px', height: '120px', transform: 'rotate(180deg)' }} alt='prev' />
                        </button>
                        <div className='albumContainer'>
                            <img src={queueTrack.album?.albumPicture ? `/covers/${queueTrack.album.albumPicture}` : defaultCover} onError={(e) => e.target.src = defaultCover} alt="cover" />
                            <button onClick={togglePlay}>
                                <img
                                    src={isPlaying ? pauseIcon : playIcon}
                                    style={{ width: '135px', height: '135px', transition: 'transform 0.2s ease' }}
                                    alt={isPlaying ? 'pause' : 'play'}
                                />
                            </button>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={nextTrack}>
                            <img src={nextIcon} style={{ width: '80px', height: '120px' }} alt='next' />
                        </button>
                    </div>
                    <h1>{queueTrack.trackName}</h1>
                    <h2>{queueTrack.artist?.artistName || 'Unknown'}</h2>
                    <div className="buttonContainer">
                        <button onClick={handleAddToPlaylistClick}>
                            <img src={addPlaylist} alt='add' />
                        </button>
                        <button onClick={handleLike}>
                            <img src={isLiked ? likeIcon : unlikeIcon} alt='like' />
                        </button>
                        <button onClick={toggleShuffle}>
                            <img
                                src={isShuffle ? shuffleOnIcon : shuffleIcon}
                                style={{ opacity: isShuffle ? 1 : 0.6 }}
                                alt='shuffle'
                            />
                        </button>
                        <button onClick={toggleRepeat}>
                            <img
                                src={
                                    repeatMode === 'off' ? repeatIcon :
                                        repeatMode === 'queue' ? repeatOnIcon :
                                            repeatTrackIcon
                                }
                                style={{ opacity: repeatMode === 'off' ? 0.6 : 1 }}
                                alt='repeat'
                            />
                        </button>
                    </div>
                    <div className="progress-container" onClick={handleProgressClick}>
                        <div className="duration">
                            <div className="progress-Bar" style={{ width: `${(currentTime / duration) * 100}%` }} />
                        </div>
                    </div>
                    <div className="time-info">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <Queue queue={queue} currentIndex={currentIndex} key={currentIndex} onSelectTrack={handleSelectTrackFromQueue} />
                {/* Аудио-тег удалён — используется глобальный плеер */}
            </div>
        </>
    );
}

export default MainPage;