import { useState, useEffect } from 'react';
import { useAudio } from '../context/audioContext.jsx';
import { useLike } from '../hooks/useLike.js';
import { useAddToPlaylist } from '../hooks/useAddToPlaylist.js';
import { useAuth } from '../hooks/useAuth.js';
import AddPlaylistModal from '../pages/AddPlaylistModal.jsx';
import pauseButton from '../components/buttons/pause100Op.svg';
import playButton from '../components/buttons/play100Op.svg';
import nextIcon from '../components/buttons/next.svg';
import addPlaylist from '../components/buttons/addPlaylist.svg'
import likeIcon from '../components/buttons/liked.svg'
import unlikeIcon from '../components/buttons/unliked.svg'
import shuffleIcon from '../components/buttons/shuffle.svg'
import shuffleOnIcon from '../components/buttons/shuffleOn.svg'
import repeatIcon from '../components/buttons/repeat.svg'
import repeatOnIcon from '../components/buttons/repeatQueue.svg'
import repeatTrackIcon from '../components/buttons/repeatTrack.svg'
import defaultCover from '../components/images/AlbumCommon.png';
import '../styles/globalPlayer.css';

function GlobalPlayer() {
    const {
        isShuffle,
        toggleShuffle,
        currentTrack,
        repeatMode,
        toggleRepeat,
        nextTrack,
        prevTrack,
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        seekTo,
    } = useAudio();
    const { isAuthenticated } = useAuth();
    const { isAddPlaylistModalOpen, toggleAddToPlaylistClick, setIsAddPlaylistModalOpen } = useAddToPlaylist(isAuthenticated);
    const { isLiked, toggleLike, setIsLiked } = useLike(currentTrack?.idSong, isAuthenticated);

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
    }

    return (
        <>
            <AddPlaylistModal
                isOpen={isAddPlaylistModalOpen}
                onClose={() => setIsAddPlaylistModalOpen(false)}
                trackId={currentTrack?.idSong}
                onTrackAdded={() => setIsLiked(true)}
            />
            <div className="global-player">
                <div className="player-content">
                    <div className="player-container">
                        <div className="picture-place">
                            <img src={currentTrack.album?.albumPicture ? `/covers/${currentTrack.album.albumPicture}` : defaultCover} onError={(e) => e.target.src = defaultCover} alt='album' />
                        </div>
                        <div className="player-info">
                            <div className="track-name">{currentTrack.trackName}</div>
                            <div className="track-Artist">{currentTrack.artist?.artistName}</div>
                        </div>
                    </div>
                    <div className="button-place">
                        <button onClick={toggleRepeat}>
                            <img
                                src={
                                    repeatMode === 'off' ? repeatIcon :
                                        repeatMode === 'queue' ? repeatOnIcon :
                                            repeatTrackIcon
                                }
                                style={{ height: '5vh', opacity: repeatMode === 'off' ? 0.6 : 1 }}
                                alt='repeat'
                            />
                        </button>
                        <button onClick={toggleShuffle}>
                            <img
                                src={isShuffle ? shuffleOnIcon : shuffleIcon}
                                style={{ height: '5vh', opacity: isShuffle ? 1 : 0.6 }}
                                alt='shuffle'
                            />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={prevTrack}>
                            <img src={nextIcon} style={{ aspectRatio: '4/6', width: '5vh', transform: 'rotate(180deg)' }} alt='prev' />
                        </button>
                        <button className="play-btn" onClick={togglePlay}>
                           <img src={isPlaying ? pauseButton : playButton} alt='play' />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={nextTrack}>
                            <img src={nextIcon} style={{ aspectRatio:'4/6', width: '5vh'}} alt='prev' />
                        </button>
                        <button onClick={toggleLike}>
                            <img src={isLiked ? likeIcon : unlikeIcon} style={{ height: '5vh', }}  alt='like' />
                        </button>
                        <button onClick={toggleAddToPlaylistClick}>
                            <img src={addPlaylist} style={{ height: '5vh', }} alt='add' />
                        </button>
                    </div>
                </div>
                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <div className="progress-bar" onClick={handleProgressClick}>
                        <div className="progress" style={{ width: `${(currentTime / duration) * 100}%` }} />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </>
    );
}

export default GlobalPlayer;