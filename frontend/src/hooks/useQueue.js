import { useState, useEffect } from 'react';

export function useQueue() {
    const [tracks, setTracks] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    
    useEffect(() => {
        fetch('/api/Track')
            .then(res => res.json())
            .then(data => {
                setTracks(data);
                createRandomQueue(data);
            });
    }, []);

    const createRandomQueue = (trackList) => {
        if (!trackList.length) return;

        const shuffled = [...trackList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setQueue(shuffled);
        setCurrentTrack(shuffled[0]);
        setCurrentIndex(0);
    };

    const nextTrack = () => {
        if (queue.length === 0) return;

        let nextIndex = currentIndex + 1;
        if (nextIndex < queue.length) {
            setCurrentIndex(nextIndex);
            setCurrentTrack(queue[nextIndex]);
        } 
    };


    const prevTrack = () => {
        if (queue.length === 0) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            prevIndex = queue.length - 1;
        }
        setCurrentIndex(prevIndex);
        setCurrentTrack(queue[prevIndex]);
    };


    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
    };

    return {
        currentTrack,
        queue,
        nextTrack,
        prevTrack,
        addToQueue,
        tracks
    };
}