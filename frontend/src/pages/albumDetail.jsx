import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/header.jsx';
import { useAudio } from '../context/audioContext';
import GlobalPlayer from '../components/globalPlayer.jsx';
import defaultCover from '../components/images/AlbumCommon.png';
import likeIcon from '../components/buttons/liked.svg';
import unlikeIcon from '../components/buttons/unliked.svg';
import addPlaylist from '../components/buttons/addPlaylist.svg';
import playButton from '../components/buttons/play100Op.svg';
import '../styles/albumDetail.css';
import { useQueue } from '../hooks/useQueue.js';
import { useAddToPlaylist } from '../hooks/useAddToPlaylist.js';
import { useLikesInList } from '../hooks/useLikesInList.js';
import AddPlaylistModal from '../pages/AddPlaylistModal.jsx';
import { useAuth } from '../hooks/useAuth.js';

function AlbumDetail() {
    const { isAuthenticated } = useAuth();
    const { playTrack, currentTrack, togglePlay} = useAudio();
    const { album, loadAlbum, playAlbum } = useQueue();
    const { isLiked, toggleLike} = useLikesInList(album?.tracks, isAuthenticated);
    const { isAddPlaylistModalOpen, toggleAddToPlaylistClick, setIsAddPlaylistModalOpen } = useAddToPlaylist(isAuthenticated);
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        loadAlbum(id);
    }, [id]);

    if (error) return <div className="album-error">{error}</div>;
    if (!album) return null;

    const handlePlayTrack = (track) => {
        const enrichedTrack = {
            ...track,
            album: album ? {
                idAlbum: album.idAlbum,
                albumName: album.albumName,
                albumPicture: album.albumPicture
            } : null,
            artist: {
                idArtist: track.idArtist,
                artistName: track.artistName
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
                <div className="album-header">
                    <button className="back-btn" onClick={() => navigate('/')}>← Назад</button>
                    <button className="add-playlist-btn">Добавить в плейлист</button>
                </div>

                <div className="album-info">
                    <button onClick={() => { playAlbum(album.idAlbum); togglePlay(); }}
                    style={{background: 'none', border:'none'}}><img
                            src={playButton}
                            alt="play"
                            style={{ width: '35px', height: '35px' }}
                        />

                    </button>
                    <img
                        src={album.albumPicture ? `/covers/${album.albumPicture}` : defaultCover}
                        alt={album.albumName}
                        className="album-cover"
                        onError={(e) => e.target.src = defaultCover}
                    />
                    <div className="album-details">
                        <h1>{album.albumName}</h1>
                        <Link to={`/artist/${album.artist?.idArtist}`} className="album-artist-link">
                            {album.artist?.artistName || 'Неизвестный исполнитель'}
                        </Link>
                    </div>
                </div>

                <div className="tracks-section">
                    <h2>Треки</h2>
                    <div className="tracks-list">
                        {album.tracks && album.tracks.length > 0 ? (
                            album.tracks.map((track, index) => (
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
                <GlobalPlayer />
            </div>
        </>
    );
}

export default AlbumDetail;