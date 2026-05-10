import { useState, useEffect } from 'react';
import { useAudio } from '../context/audioContext.jsx';
import pauseButton from '../components/buttons/pause.svg';
import playButton from '../components/buttons/play.svg';
import nextIcon from '../components/buttons/next.svg';
import '../styles/globalPlayer.css';

function GlobalPlayer() {
    const { nextTrack, prevTrack , isPlaying, togglePlay, currentTime, duration, seekTo, currentTrack} = useAudio();


    if (!currentTrack) return null;

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

    return (
        <div className="global-player">
            <div className="player-info">
                <div className="track-name">{currentTrack.trackName}</div>
                <div className="track-artist">{currentTrack.artistName}</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={prevTrack}>
                <img src={nextIcon} style={{ aspectRatio: '4/6', width: '5vh', transform: 'rotate(180deg)' }} alt='prev' />
            </button>
            <button className="play-btn" onClick={togglePlay}>
               <img src={isPlaying ? pauseButton : playButton} alt='play' />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={nextTrack}>
                <img src={nextIcon} style={{ aspectRatio:'4/6', width: '5vh'}} alt='prev' />
            </button>
            <div className="progress-container">
                <span>{formatTime(currentTime)}</span>
                <div className="progress-bar" onClick={handleProgressClick}>
                    <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }} />
                </div>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
}

export default GlobalPlayer;