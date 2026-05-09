import { useState } from 'react';
import albumPic from '../components/images/album.svg';
import artistPic from '../components/images/artist.svg';
import searchPic from '../components/images/search.svg';
import '../styles/search.css';

function Search({ onTrackSelect, onArtistSelect, onAlbumSelect }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        tracks: [],
        artists: [],
        albums: []
    });

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults({ tracks: [], artists: [], albums: [] });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/Search?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        handleSearch(value);
    };

    return (
        <div className="search-container">
            <div className="search-input-wrapper">
                <img style={{ aspectRatio: 1, width: '2vw' }} alt='search' src={searchPic} />
                <input
                    type="text"
                    placeholder="Поиск музыки, исполнителей, альбомов..."
                    value={query}
                    onChange={handleInputChange}
                    className="search-input"
                />
                {loading && <div className="search-loader"></div>}
            </div>

            {/* Секция Треки */}
            <div className="search-section">
                <div className="search-section-header">
                    <span className="search-section-title">Треки</span>
                    <span className="search-section-count">{results.tracks?.length || 0}</span>
                </div>
                <div className="search-section-results">
                    {results.tracks?.map(track => (
                        <div
                            key={track.idSong}
                            className="search-result-item"
                            onClick={() => onTrackSelect?.(track)}
                        >
                            <span className="result-name">{track.trackName}</span>
                            <span className="result-sub">{track.artistName}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Секция Исполнители */}
            <div className="search-section">
                <div className="search-section-header">
                    <span className="search-section-title">Исполнители</span>
                    <span className="search-section-count">{results.artists?.length || 0}</span>
                </div>
                <div className="search-section-results">
                    {results.artists?.map(artist => (
                        <div
                            key={artist.idArtist}
                            className="search-result-item"
                            onClick={() => onArtistSelect?.(artist)}
                        >
                            <img style={{ aspectRatio: 1, width: '2vw' }} alt='artist' src={artistPic} />
                            <span className="result-name">{artist.artistName}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Секция Альбомы */}
            <div className="search-section">
                <div className="search-section-header">
                    <span className="search-section-title">Альбомы</span>
                    <span className="search-section-count">{results.albums?.length || 0}</span>
                </div>
                <div className="search-section-results">
                    {results.albums?.map(album => (
                        <div
                            key={album.idAlbum}
                            className="search-result-item"
                            onClick={() => onAlbumSelect?.(album)}
                        >
                            <img style={{ aspectRatio: 1, width: '2vw' }} alt='albim' src={albumPic} />
                            <span className="result-name" onClick={() => window.open(`/album/${album.idAlbum}`, '_blank')}>{album.albumName}</span>
                        </div>
                    ))}
                    {results.albums?.length === 0 && query && (
                        <div className="search-empty">Ничего не найдено</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;