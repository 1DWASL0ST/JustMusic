import { useState, useRef } from 'react';
import '../styles/global.css';
import nextIcon from '../components/buttons/next.svg';
import playIcon from '../components/buttons/play.svg';
import pauseIcon from '../components/buttons/pause.svg';
import { useQueue} from '../hooks/useQueue.js';

function MainPage() {
    const { currentTrack, nextTrack, prevTrack } = useQueue();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

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
    if (!currentTrack) {
        return (<div className="loading"><h1>Музыка вот вот будет</h1></div>);
    }

    return (
        <><div className='mainHeader'>
            <h1>Только Музыка</h1>
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
                        <img className='albumImage' alt=""></img>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={Play}>
                                <img
                                    src={isPlaying ? pauseIcon : playIcon}
                                    style={{ width: '135px', height: '135px' }}
                                    alt={isPlaying ? 'pause' : 'play'}
                                />
                            </button>
                    </div>
                        <button className style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={Next}> 
                            <img src={nextIcon} style={{width: '80px', height: '120px',}} alt = 'next'></img>
                    </button>
                </div>
                <h1>{currentTrack.trackName}</h1>
                <h2>{currentTrack.artist.artistName}</h2>
            </div>
            <div className='queue'>
                <h1>Здесь будет очередь</h1>
            </div>
                {currentTrack && (
                    <audio ref={audioRef} src={`api/Track/stream/${currentTrack.idSong}`} onEnded={Next}/>    
                )}
        </div>
        </>
    );
}

export default MainPage;