import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../api/api';

export function useLikesInList(tracks, isAuthenticated) {
    const [likesMap, setLikesMap] = useState({});
    const [loading, setLoading] = useState({});
    const navigate = useNavigate();

    const loadLikeStatus = async (trackId) => {
        if (!isAuthenticated) return;

        try {
            const response = await authFetch(`/api/Track/${trackId}/like-status`);
            const data = await response.json();
            setLikesMap(prev => ({ ...prev, [trackId]: data.liked }));
        } catch (error) {
            console.error('Ошибка загрузки статуса лайка:', error);
        }
    };

    const toggleLike = async (trackId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(prev => ({ ...prev, [trackId]: true }));

        const wasLiked = likesMap[trackId];
        setLikesMap(prev => ({ ...prev, [trackId]: !wasLiked }));

        try {
            const response = await authFetch(`/api/Track/${trackId}/like`, {
                method: 'POST'
            });
            const data = await response.json();
            setLikesMap(prev => ({ ...prev, [trackId]: data.liked }));
        } catch (error) {
            setLikesMap(prev => ({ ...prev, [trackId]: wasLiked }));
        } finally {
            setLoading(prev => ({ ...prev, [trackId]: false }));
        }
    };

    useEffect(() => {

        if (tracks?.length && isAuthenticated) {
            tracks.forEach(track => loadLikeStatus(track.idSong));
        }
    }, [tracks, isAuthenticated]);

    const isLiked = (trackId) => likesMap[trackId] || false;
    const isLiking = (trackId) => loading[trackId] || false;

    return { isLiked, isLiking, toggleLike };
}