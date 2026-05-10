import { useState, useEffect } from 'react';

export function useQueue(currentTrack) {
    const [allTracks, setAllTracks] = useState([]);
    const [originalQueue, setOriginalQueue] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        fetch('/api/Track')
            .then(res => res.json())
            .then(data => {
                setAllTracks(data);
                createOriginalQueue(data);
                setIsLoading(false);
            })
            .catch(err => console.error('Ошибка загрузки треков:', err));
    }, []);

    const createOriginalQueue = (trackList) => {
        if (!trackList.length) return;
        const original = [...trackList];
        setOriginalQueue(original);
        setQueue(original);
        setCurrentIndex(0);
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
                    setQueue(tracks);           
                    setOriginalQueue(tracks);  
                    setCurrentIndex(0);         
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
            setCurrentPlaylistId(null);
        }
    };

    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
        setOriginalQueue(prev => [...prev, track]);
    };

    return {
        loadPlaylistTracks,
        originalQueue,
        setQueue,
        queue,           
        currentIndex,    
        addToQueue,
        tracks: allTracks,
        isLoading,
        loadPlaylistTracks,
        resetToAllTracks,
        isPlayingPlaylist: currentPlaylistId !== null,
        setCurrentIndex,
    };
}