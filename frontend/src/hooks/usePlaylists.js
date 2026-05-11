import { useState } from 'react';

export function usePlaylist() {
    const [isPlaylistsModalOpen, setIsPlaylistsModalOpen] = useState(false);

    const togglePlaylistsClick = () => {
        setIsPlaylistsModalOpen(true);
    };

    return { isPlaylistsModalOpen, setIsPlaylistsModalOpen, togglePlaylistsClick };
}