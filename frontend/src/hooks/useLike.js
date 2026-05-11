import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../api/api'; 

export function useLike(trackId, isAuthenticated) {
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const checkLikeStatus = async () => {
        if (!trackId || !isAuthenticated) return;

        try {
            const response = await authFetch(`/api/Track/${trackId}/like-status`);
            const data = await response.json();
            setIsLiked(data.liked);
        } catch (error) {
            console.error('Ошибка проверки лайка:', error);
        }
    };

    const toggleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await authFetch(`/api/Track/${trackId}/like`, {
                method: 'POST'
            });
            const data = await response.json();
            setIsLiked(data.liked);
        } catch (error) {
            console.error('Ошибка при лайке:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            checkLikeStatus();
        }
    }, [trackId, isAuthenticated,]);

    return { isLiked, loading, toggleLike, setIsLiked };
}