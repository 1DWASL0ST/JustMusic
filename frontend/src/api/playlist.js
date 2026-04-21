import { authFetch } from './api';

export const getPlaylists = async () => {
    const response = await authFetch('/api/Playlists');
    if (!response.ok) throw new Error('Ошибка загрузки плейлистов');
    return response.json();
};

export const getPlaylistTracks = async (playlistId) => {
    const response = await authFetch(`/api/Playlists/${playlistId}/tracks`);
    if (!response.ok) throw new Error('Ошибка загрузки треков плейлиста');
    return response.json();
};

export const createPlaylist = async (name) => {
    const response = await authFetch('/api/Playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Ошибка создания плейлиста');
    return response.json();
};

export const addTrackToPlaylist = async (playlistId, trackId) => {
    const response = await authFetch(`/api/Playlists/${playlistId}/tracks/${trackId}`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Ошибка добавления трека');
    return response.json();
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
    const response = await authFetch(`/api/Playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка удаления трека');
    return response.ok;
};

export const deletePlaylist = async (playlistId) => {
    const response = await authFetch(`/api/Playlists/${playlistId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Ошибка удаления плейлиста');
    return response.ok;
};
