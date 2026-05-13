import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/header.jsx';
import { useAudio } from '../context/audioContext';
import GlobalPlayer from '../components/globalPlayer.jsx';
import defaultCover from '../components/images/AlbumCommon.png';
import likeIcon from '../components/buttons/liked.svg';
import unlikeIcon from '../components/buttons/unliked.svg';
import addPlaylist from '../components/buttons/addPlaylist.svg';
import playButton from '../components/buttons/playInvert.svg';
import '../styles/albumDetail.css';
import { useArtist } from '../hooks/useArtists.js';
import { useAddToPlaylist } from '../hooks/useAddToPlaylist.js';
import { useLikesInList } from '../hooks/useLikesInList.js';
import AddPlaylistModal from '../pages/AddPlaylistModal.jsx';
import { useAuth } from '../hooks/useAuth.js';


function ArtistDetail() {
    const { isAuthenticated } = useAuth();
    const { playTrack, currentTrack, handlePlayArtist } = useAudio();
    const { tracklist,
            loading,
            loadArtitsTracklist,
            loadArtistAlbums,
            albums,
            artist,
            loadArtist,} = useArtist();
    const { isLiked, toggleLike } = useLikesInList(tracklist, isAuthenticated);
    const { isAddPlaylistModalOpen, toggleAddToPlaylistClick, setIsAddPlaylistModalOpen } = useAddToPlaylist(isAuthenticated);
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        loadArtist(id);
        loadArtitsTracklist(id);
        loadArtistAlbums(id);
    }, [id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div className="album-error">{error}</div>;
    if (!artist) return null;

    const handlePlayClick = (e, id) => {
        e.stopPropagation();
        if (handlePlayArtist) {
            handlePlayArtist(id);
        }
    };

    const handlePlayTrack = (track) => {
        const enrichedTrack = {
            ...track,
            album: {
                idAlbum: track.album.idAlbum,
                albumName: track.album.albumName,
                albumPicture: track.album.albumPicture
            } ,
            artist: {
                idArtist: track.idArtist,
                artistName: artist.artistName
            }
        };
        playTrack(enrichedTrack);
    };

    return (
        <>
            <AddPlaylistModal
                isOpen={isAddPlaylistModalOpen}
                onClose={() => setIsAddPlaylistModalOpen(false)}
                trackId={currentTrack?.idSong}
            />
            <Header />
            <div className="album-page">
                <div className="album-info">
                    <div className="album-details">
                        <h1>{artist.artistName}</h1>
                        <div className="album-artist-link">
                            {artist.artistDef || ''}
                        </div>
                        <button onClick={(e) => handlePlayClick(e, id)}
                            style={{ background: 'none', border: 'none' }}><img
                                src={playButton}
                                alt="play"
                                style={{ width: '10vw' }}
                            />

                        </button>
                    </div>
                </div>

                <div className="tracks-section">
                    <h2>Треки</h2>
                    <div className="tracks-list">
                        {tracklist ? (
                            tracklist.map((track, index) => (
                                <div key={track.idSong} className="track-item" onClick={() => handlePlayTrack(track)}>
                                    <div className="track-number">{index + 1}</div>
                                    <div className="track-info" onClick={() => playTrack(track)}>
                                        <div className="track-name">{track.trackName}</div>
                                        <div className="track-artist">{track.artistName}</div>
                                    </div>
                                    <div className="track-duration">
                                        {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : '—'}
                                    </div>
                                    <div className="track-actions">
                                        <button
                                            className="track-like-btn"
                                            onClick={() => toggleLike(track.idSong)}
                                        >
                                            <img
                                                src={isLiked(track.idSong) ? likeIcon : unlikeIcon}
                                                alt="like"
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </button>
                                        <button
                                            className="track-add-btn"
                                            onClick={toggleAddToPlaylistClick}
                                        >
                                            <img
                                                src={addPlaylist}
                                                alt="add to playlist"
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-tracks">Нет треков в альбоме</div>
                        )}
                    </div>
                </div>
                <div className="albums-section">
                    <h2>Альбомы</h2>
                    <div className="albums-grid">
                        {albums.map((album) => (
                            <div
                                key={album.idAlbum}
                                className="album-card"
                                onClick={() => navigate(`/album/${album.idAlbum}`)}
                            >
                                <img
                                    src={album.albumPicture ? `/covers/${album.albumPicture}` : defaultCover}
                                    alt={album.albumName}
                                    className="album-card-cover"
                                    onError={(e) => e.target.src = defaultCover}
                                />
                                <div className="album-card-name">{album.albumName}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <GlobalPlayer />
            </div>
        </>
    );
}

export default ArtistDetail;