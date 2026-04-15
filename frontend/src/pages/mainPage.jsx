import { useState, useRef,useEffect } from 'react';
import '../styles/global.css';
import nextIcon from '../components/buttons/next.svg';
import playIcon from '../components/buttons/play.svg';
import pauseIcon from '../components/buttons/pause.svg';
import { useQueue } from '../hooks/useQueue.js';
import defaultCover from '../components/images/AlbumCommon.png';
import { useNavigate } from 'react-router-dom';

function MainPage() {
    const { currentTrack, nextTrack, prevTrack } = useQueue();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
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

    if (!currentTrack) {
        return (<div className="loading"><h1> </h1> <h1> </h1>  <h1>Музыка вот вот будет</h1></div>);
    }

    return (
       <>
       <div className='mainHeader'>
            <h1 onClick={() => navigate('/')}>Только Музыка</h1>
            {!isAuthenticated ? 
            (
                <>
                    <button onClick={() => navigate('/login')}>Войти</button>
                    <button style={{ background: 'none', border: '1px solid black', color: '#251f1f' }} onClick={() => navigate('/register')}>Регистрация</button>
                </>
            ) 
            :(
                <>
                    <button onClick={() => navigate('/playlists')}>Плейлисты</button>
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
                    <button style={{ background: 'none', border: 'none', cursor:'pointer' }} onClick={Prev}>
                        <img src={nextIcon} style={{ width: '80px', height: '120px', transform: 'rotate(180deg)'}} alt='prev'></img>
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
                            <img src={nextIcon} style={{width: '80px', height: '120px',}} alt = 'next'></img>
                    </button>
                </div>
                <h1>{currentTrack.trackName}</h1>
                <h2>{currentTrack.artist.artistName}</h2>
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
            <div className='queue'>
                <h1>Здесь будет очередь</h1>
            </div>
                {currentTrack && (
                    <audio ref={audioRef} src={`api/Track/stream/${currentTrack.idSong}`} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={Next}/>    
                )}
        </div>
        </>
    );
}

export default MainPage;