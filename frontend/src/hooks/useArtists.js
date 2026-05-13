import { useState } from 'react';

export function useArtist() {
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [albums, setAlbums] = useState([]);
    const [tracklist, setTracklist] = useState([]);


    const loadArtist = async (id) => {
        try {
            const response = await fetch(`/api/Artist/${id}`);

            const data = await response.json();

            setArtist(data);

        } catch (error) {
            console.error('Ошибка загрузки артиста:', error);
        }
    };

    const loadArtistAlbums = async (id) => {
        try {
            const response = await fetch(`/api/Artist/${id}/albums`);

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setAlbums(data)
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки альбомов артиста:', error);
        }
    };

    const loadArtitsTracklist = async (id) => {
        try {
            const response = await fetch(`/api/Artist/${id}/tracks`);

            if (response.ok) {
                const tracks = await response.json();
                if (tracks.length > 0) {
                    setTracklist(tracks);
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки треков артиста:', error);
        }
    };

    
    return {
        tracklist,
        loadArtitsTracklist,
        loadArtistAlbums,
        albums,
        artist,
        loadArtist,
        errorMessage,
        loading,
    };
}