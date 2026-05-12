import { useState } from 'react';
import { authFetch } from '../api/api.js';

export function usePlaylist({ onClose }) {
    const [isPlaylistsModalOpen, setIsPlaylistsModalOpen] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleClose = () => {
        setErrorMessage('');
        onClose();
    };

    const togglePlaylistsClick = () => {
        setIsPlaylistsModalOpen(true);
    };

    const loadPlaylists = async () => {
        setLoading(true);
        try {
            const response = await authFetch('/api/Playlists');
            const data = await response.json();
            setPlaylists(data);
        } catch (error) {
            console.error('Ошибка загрузки плейлистов:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToPlaylist = async (playlistId, trackId, check) => {
        try {
            const response = await authFetch(`/api/Playlists/${playlistId}/tracks/${trackId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (check) {
                return;
            }
            if (response.ok) {
                handleClose();
            } else if (response.status === 400) {
                setErrorMessage(data.message || 'Трек уже есть в этом плейлисте');
            } else {
                setErrorMessage('Ошибка при добавлении трека');
            }
        } catch (error) {
            console.error('Ошибка добавления:', error);
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            const response = await authFetch('/api/Playlists', {
                method: 'POST',
                body: JSON.stringify({ playlistName: newPlaylistName })
            });
            if (response.ok) {
                const data = await response.json();
                setNewPlaylistName('');
                setShowCreateForm(false);
                await loadPlaylists();
                return data;
            }
        } catch (error) {
            console.error('Ошибка создания:', error);
        }
    };

    const createPlaylistFromAlbum = async (album) => {
        if (!album?.tracks?.length) {
            alert('В альбоме нет треков');
            return;
        }

        const newPlaylist = await createPlaylist();

        const reversedAlbumTracks = [...album.tracks].reverse();
        for (const track of reversedAlbumTracks) {
            await addToPlaylist(newPlaylist.idPlaylist, track.idSong,true);
        }

        alert(`Плейлист "${album.albumName}" создан! Добавлено ${album.tracks.length} треков`);
    };
    return {
        createPlaylistFromAlbum,
        isPlaylistsModalOpen,
        setIsPlaylistsModalOpen,
        togglePlaylistsClick, 
        loadPlaylists,
        errorMessage,
        loading,
        playlists,
        addToPlaylist,
        showCreateForm,
        newPlaylistName,
        setNewPlaylistName,
        createPlaylist,
        setShowCreateForm
    };
}