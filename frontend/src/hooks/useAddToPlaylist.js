import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAddToPlaylist(isAuthenticated) {
    const [isAddPlaylistModalOpen, setIsAddPlaylistModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleAddToPlaylistClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsAddPlaylistModalOpen(true);
    };

    
    return { isAddPlaylistModalOpen, toggleAddToPlaylistClick, setIsAddPlaylistModalOpen };
}