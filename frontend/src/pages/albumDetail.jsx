import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import defaultCover from '../components/images/AlbumCommon.svg';
import likeIcon from '../components/buttons/liked.svg';
import unlikeIcon from '../components/buttons/unliked.svg';
import addPlaylist from '../components/buttons/addPlaylist.svg';
import { authFetch } from '../api/api';
import './AlbumDetail.css';

function AlbumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likedTracks, setLikedTracks] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTrackId, setSelectedTrackId] = useState(null);

    useEffect(() => {
        loadAlbum();
        checkAuth();
    }, [id]);

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        setIsAuthenticated(!!token);
    };

    const loadAlbum = async () => {
        try {
            const response = await fetch(`/api/Albums/${id}`);
            if (response.ok) {
                const data = await response.json();
                setAlbum(data);
                if (isAuthenticated) {
                    checkLikesStatus(data.tracks);
                }
            } else {
                setError('Альбом не найден');
            }
        } catch (error) {
            setError('Ошибка загрузки альбома');
        } finally {
            setLoading(false);
        }
    };

    const checkLikesStatus = async (tracks) => {
        const likesStatus = {};
        for (const track of tracks) {
            try {
                const response = await authFetch(`/api/Tracks/${track.idSong}/like-status`);
                const data = await response.json();
                likesStatus[track.idSong] = data.liked;
            } catch (error) {
                likesStatus[track.idSong] = false;
            }
        }
        setLikedTracks(likesStatus);
    };

    const handleLike = async (trackId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await authFetch(`/api/Tracks/${trackId}/like`, {
                method: 'POST'
            });
            if (response.ok) {
                const data = await response.json();
                setLikedTracks(prev => ({
                    ...prev,
                    [trackId]: data.liked
                }));
            }
        } catch (error) {
            console.error('Ошибка лайка:', error);
        }
    };

    const handleAddToPlaylist = (trackId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setSelectedTrackId(trackId);
        setShowAddModal(true);
    };

    const playTrack = (track) => {
        console.log('Воспроизведение:', track);
        // TODO: добавить воспроизведение трека
    };

    if (loading) return <div className="album-loading">Загрузка...</div>;
    if (error) return <div className="album-error">{error}</div>;
    if (!album) return null;

    return (
        <div className="album-page">
            <div className="album-header">
                <button className="back-btn" onClick={() => navigate(-1)}>← Назад</button>
                <button className="add-playlist-btn">Добавить в плейлист</button>
            </div>

            <div className="album-info">
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
                            <div key={track.idSong} className="track-item">
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
                                        onClick={() => handleLike(track.idSong)}
                                    >
                                        <img
                                            src={likedTracks[track.idSong] ? likeIcon : unlikeIcon}
                                            alt="like"
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                    </button>
                                    <button
                                        className="track-add-btn"
                                        onClick={() => handleAddToPlaylist(track.idSong)}
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

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Добавить в плейлист</h3>
                        <p>Выбор плейлиста (в разработке)</p>
                        <button onClick={() => setShowAddModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AlbumDetail;