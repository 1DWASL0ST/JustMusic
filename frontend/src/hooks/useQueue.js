import { useState, useEffect } from 'react';

export function useQueue() {
    const [allTracks, setAllTracks] = useState([]);
    const [originalQueue, setOriginalQueue] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');

    useEffect(() => {
        fetch('/api/Track')
            .then(res => res.json())
            .then(data => {
                setAllTracks(data);
                createOriginalQueue(data);
                createDisplayQueue(data);
                setIsLoading(false);
            })
            .catch(err => console.error('Ошибка загрузки треков:', err));
    }, []);

    const createOriginalQueue = (trackList) => {
        if (!trackList.length) return;
        setOriginalQueue([...trackList]);
    };

    const createDisplayQueue = (trackList) => {
        if (!trackList.length) return;

        let newQueue;
        if (isShuffle) {
            newQueue = [...trackList];
            for (let i = newQueue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newQueue[i], newQueue[j]] = [newQueue[j], newQueue[i]];
            }
        } else {
            newQueue = [...trackList];
        }

        setQueue(newQueue);
        setCurrentTrack(newQueue[0]);
        setCurrentIndex(0);
    };

    const updateQueueWithShuffle = () => {
        const sourceList = currentPlaylistId === null ? allTracks : originalQueue;

        const currentTrackCopy = currentTrack;

        const otherTracks = sourceList.filter(t => t.idSong !== currentTrackCopy?.idSong);

        for (let i = otherTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
        }

        const newQueue = currentTrackCopy ? [currentTrackCopy, ...otherTracks] : [...otherTracks];

        setQueue(newQueue);
        setCurrentTrack(newQueue[0]);
        setCurrentIndex(0);
    };

    const toggleShuffle = () => {
        setIsShuffle(!isShuffle);
        setTimeout(() => {
            updateQueueWithShuffle();
        }, 0);
    };

    const toggleRepeat = () => {
        const modes = ['off', 'queue', 'track'];
        const currentIdx = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIdx + 1) % modes.length];
        setRepeatMode(nextMode);
    };

    const loadPlaylistTracks = async (playlistId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/Playlists/${playlistId}/tracks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const tracks = await response.json();
                if (tracks.length > 0) {
                    createOriginalQueue(tracks);
                    createDisplayQueue(tracks);
                    setCurrentPlaylistId(playlistId);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки плейлиста:', error);
        }
    };

    const resetToAllTracks = () => {
        if (allTracks.length > 0) {
            createOriginalQueue(allTracks);
            createDisplayQueue(allTracks);
            setCurrentPlaylistId(null);
        }
    };

    const createRandomQueue = (trackList) => {
        createOriginalQueue(trackList);
        createDisplayQueue(trackList);
    };

    const nextTrack = () => {
        if (queue.length === 0) return;

        let nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
        }
        else {
            if (repeatMode === 'queue') {
                setCurrentIndex(0);
                setCurrentTrack(queue[0]);
            } else if (repeatMode === 'track') {
                setCurrentTrack(queue[currentIndex]);
            }
        }
    };



    const prevTrack = () => {
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
    };


    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
        setOriginalQueue(prev => [...prev, track]);
    };

    return {
        currentTrack,
        queue,           
        currentIndex,    
        nextTrack,
        prevTrack,
        addToQueue,
        tracks: allTracks,
        isLoading,
        loadPlaylistTracks,
        resetToAllTracks,
        isPlayingPlaylist: currentPlaylistId !== null,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat

    };
}