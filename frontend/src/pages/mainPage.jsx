import { useState, useRef, useEffect } from 'react';
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
import defaultCover from '../components/images/AlbumCommon.png';
import { useNavigate } from 'react-router-dom';
import AddPlaylistModal from '../pages/AddPlaylistModal.jsx';
import PlaylistsModal from '../pages/PlaylistModal.jsx';
import Queue from '../pages/Queue.jsx';
import { authFetch } from '../api/api.js';

function MainPage() {
    const {
        currentTrack,
        nextTrack,
        prevTrack,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        queue,
        currentIndex,
        setCurrentTrack,
        setCurrentIndex,
        loadPlaylistTracks
    } = useQueue();

    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
    const [isPlaylistsModalOpen, setIsPlaylistsModalOpen] = useState(false);

    // Лайк — добавляет/удаляет в "Избранное" без открытия окон
    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await authFetch(`/api/Track/${currentTrack?.idSong}/like`, {
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

    // Плюс — открывает окно для добавления в плейлист
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
        if (currentTrack && isAuthenticated) {
            checkLikeStatus();
        }
    }, [currentTrack, isAuthenticated]);

    const checkLikeStatus = async () => {
        try {
            const response = await authFetch(`/api/Track/${currentTrack?.idSong}/like-status`);
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

    const Play = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const Next = () => {
        nextTrack();
        setIsPlaying(false);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 100);
    };

    const Prev = () => {
        prevTrack();
        setIsPlaying(false);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 100);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };
    const handleSelectTrackFromQueue = (track, index) => {
        setCurrentIndex(index);
        setCurrentTrack(track);

        setIsPlaying(false);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();  
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 100);
    };

    const handlePlayPlaylist = (playlist) => {
        console.log('Воспроизведение плейлиста:', playlist);
        loadPlaylistTracks(playlist.idPlaylist);  
        setIsPlaylistsModalOpen(false);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.load();
                audioRef.current.play();
                setIsPlaying(true);
            }
        }, 100);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
        
            if (repeatMode === 'track') {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextTrack();
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.play()
                            .then(() => setIsPlaying(true))
                            .catch(e => console.log('Play error:', e));
                    }
                }, 100);
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [repeatMode, nextTrack, currentTrack]);  
    if (!currentTrack) {
        return (<div className="loading"><h1> </h1><h1> </h1><h1>Музыка вот вот будет</h1></div>);
    }

    return (
        <>
            <AddPlaylistModal
                isOpen={isAddPlaylistModalOpen}
                onClose={() => setIsAddPlaylistModalOpen(false)}
                trackId={currentTrack?.idSong}
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
                            <button onClick={() => navigate('/profile')}>Профиль</button>
                            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid black', color: '#251f1f' }}>
                                Выйти
                            </button>
                        </>
                    )}
            </div>

            <div className='mainPart'>
                <div className='search'>
                    <h1>Здесь будет поиск</h1>
                </div>
                <div className='mainContent'>
                    <div className='mainPlayer'>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={Prev}>
                            <img src={nextIcon} style={{ width: '80px', height: '120px', transform: 'rotate(180deg)' }} alt='prev' />
                        </button>
                        <div className='albumContainer'>
                            <img src={currentTrack.album?.albumPicture ? `/covers/${currentTrack.album.albumPicture}` : defaultCover} onError={(e) => e.target.src = defaultCover} alt="cover" />
                            <button onClick={Play}>
                                <img
                                    src={isPlaying ? pauseIcon : playIcon}
                                    style={{ width: '135px', height: '135px', transition: 'transform 0.2s ease' }}
                                    alt={isPlaying ? 'pause' : 'play'}
                                />
                            </button>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={Next}>
                            <img src={nextIcon} style={{ width: '80px', height: '120px' }} alt='next' />
                        </button>
                    </div>
                    <h1>{currentTrack.trackName}</h1>
                    <h2>{currentTrack.artist.artistName}</h2>
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
                    <div className="progress-container" onClick={handleSeek}>
                        <div className="duration">
                            <div className="progress-bar" style={{ width: `${(currentTime / duration) * 100}%` }} />
                        </div>
                    </div>
                    <div className="time-info">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <Queue queue={queue} currentIndex={currentIndex} key={currentIndex} onSelectTrack={handleSelectTrackFromQueue} />
                {currentTrack && (
                    <audio
                        ref={audioRef}
                        src={`api/Track/stream/${currentTrack.idSong}`}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                )}
            </div>
        </>
    );
}

export default MainPage;