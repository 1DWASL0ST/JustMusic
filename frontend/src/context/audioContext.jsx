import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useQueue } from '../hooks/useQueue';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
    const {
        resetToAllTracks,
        loadPlaylistTracks,
        playAlbum,
        queue,
        currentIndex,
        setCurrentIndex,
        originalQueue,
        setQueue
    } = useQueue();

    const [currentTrack, setCurrentTrack] = useState(queue[currentIndex]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [repeatMode, setRepeatMode] = useState('off');
    const audioRef = useRef(null);

    useEffect(() => {
        if (queue[currentIndex]) {
            setCurrentTrack(queue[currentIndex]);
        }
    }, [currentIndex, queue]);

    const playTrack = (track, forceRestart = false) => {
        if (!track) return;

        if (currentTrack?.idSong === track.idSong) {
            audioRef.current?.play();
            setIsPlaying(true);
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleRepeat = () => {
        const modes = ['off', 'queue', 'track'];
        const currentIdx = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIdx + 1) % modes.length];
        setRepeatMode(nextMode);
    };

    const toggleShuffle = useCallback(() => {
        const newShuffleState = !isShuffle;
        setIsShuffle(newShuffleState);

        let newQueue;
        if (newShuffleState) {
            newQueue = [...queue];
            for (let i = newQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
            }
        } else {
            newQueue = [...originalQueue];
        }

        setQueue(newQueue);

        const currentTrackId = currentTrack?.idSong;
        const newIndex = newQueue.findIndex(t => t.idSong === currentTrackId);
        if (newIndex !== -1) {
            setCurrentIndex(newIndex);
        } else {
            setCurrentIndex(0);
        }
    }, [isShuffle, queue, originalQueue, currentTrack, setCurrentIndex]);

    const nextTrack = useCallback(() => {
        if (queue.length === 0) return;

        if (repeatMode === 'track') {

            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
            }
            return; 
        }

        let nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            playTrack(queue[nextIndex]);
        }
        else if (repeatMode === 'queue') {
            setCurrentIndex(0);
            playTrack(queue[0]);
        }
    }, [currentIndex, queue, repeatMode, playTrack]);



    const prevTrack = useCallback(() => {
        if (queue.length === 0) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            if (repeatMode === 'queue') {
                prevIndex = queue.length - 1;
            } else {
                prevIndex = 0;
            }
        }
        setCurrentIndex(prevIndex);
        setCurrentTrack(queue[prevIndex]);
        playTrack(queue[prevIndex]);
    }, [currentIndex, queue, repeatMode, playTrack]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handlePlayPlaylist = (playlist) => {
        loadPlaylistTracks(playlist.idPlaylist);
    };

    const handlePlayAlbum = (albumId) => {
        playAlbum(albumId);
    }

    const seekTo = (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    useEffect(() => {
        if (currentTrack && audioRef.current) {
            audioRef.current.src = `/api/Track/stream/${currentTrack.idSong}`;
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play();
            }
            
        }
    }, [currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            setIsPlaying(false);
            nextTrack();
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [nextTrack]);

    return (
        <AudioContext.Provider value={{
            resetToAllTracks,
            handlePlayAlbum,
            setCurrentIndex,
            handlePlayPlaylist,
            isShuffle,
            toggleShuffle,
            queue,
            currentTrack,
            setCurrentTrack,
            nextTrack,
            prevTrack,
            repeatMode,
            isPlaying,
            currentTime,
            duration,
            seekTo,
            playTrack,
            togglePlay,
            toggleRepeat,
            setCurrentTime,
            currentIndex,
            audioRef
        }}>
            {children}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />
        </AudioContext.Provider>
    );
}

export const useAudio = () => useContext(AudioContext);