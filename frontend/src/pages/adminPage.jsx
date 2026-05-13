import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { authFetch } from '../api/api';
import { useAdmin } from '../hooks/useAdmin';
import '../styles/adminPage.css';

function AdminPage() {
    const navigate = useNavigate();
    const { isAdmin, loading: adminLoading } = useAdmin();
    const [activeTab, setActiveTab] = useState('tracks');
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const [newTrack, setNewTrack] = useState({ trackName: '', idArtist: '', idAlbum: ''});
    const [newArtist, setNewArtist] = useState({ artistName: '',  artistDef: '' });
    const [newAlbum, setNewAlbum] = useState({ albumName: '', idArtist: '' });

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, adminLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [activeTab, isAdmin]);

    if (adminLoading) {
        return <div className="admin-loading">Проверка прав доступа...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tracks') {
                const res = await authFetch('/api/Track');
                const data = await res.json();
                setTracks(data);
            } else if (activeTab === 'artists') {
                const res = await authFetch('/api/Artist');
                const data = await res.json();
                setArtists(data);
            } else if (activeTab === 'albums') {
                const res = await authFetch('/api/Album');
                const data = await res.json();
                setAlbums(data);
            } else if (activeTab === 'users') {
                const res = await authFetch('/api/User');
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            setError('Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTrack = async () => {
        if (!newTrack.file) {
            setError('Выберите MP3 файл');
            return;
        }

        const formData = new FormData();
        formData.append('trackName', newTrack.trackName);
        formData.append('artistId', newTrack.idArtist);
        formData.append('albumId', newTrack.idAlbum);

        try {
            const response = await authFetch('/api/Track', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                setSuccess('Трек добавлен');
                setNewTrack({ trackName: '', idArtist: '', idAlbum: '' });
                loadData();
            } else {
                setError('Ошибка добавления');
            }
        } catch (err) {
            setError('Ошибка');
        }
    };

    const handleDeleteTrack = async (id) => {
        if (window.confirm('Удалить трек?')) {
            const response = await authFetch(`/api/Track/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSuccess('Трек удалён');
                loadData();
            } else {
                setError('Ошибка удаления');
            }
        }
    };

    const handleAddArtist = async () => {
        const response = await authFetch('/api/Artist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newArtist)
        });
        if (response.ok) {
            setSuccess('Исполнитель добавлен');
            setNewArtist({ artistName: '',  artistDef: '' });
            loadData();
        } else {
            setError('Ошибка добавления');
        }
    };

    const handleDeleteArtist = async (id) => {
        if (window.confirm('Удалить исполнителя?')) {
            const response = await authFetch(`/api/Artist/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSuccess('Исполнитель удалён');
                loadData();
            } else {
                setError('Ошибка удаления');
            }
        }
    };

    const handleAddAlbum = async () => {
        if (!newAlbum.picture) {
            setError('Выберите PNG файл для обложки');
            return;
        }

        const formData = new FormData();
        formData.append('albumName', newAlbum.albumName);
        formData.append('idArtist', newAlbum.idArtist);

        try {
            const response = await authFetch('/api/Album', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                setSuccess('Альбом добавлен');
                setNewAlbum({ albumName: '', idArtist: ''});
                loadData();
            } else {
                setError('Ошибка добавления');
            }
        } catch (err) {
            setError('Ошибка');
        }
    };

    const handleDeleteAlbum = async (id) => {
        if (window.confirm('Удалить альбом?')) {
            const response = await authFetch(`/api/Album/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSuccess('Альбом удалён');
                loadData();
            } else {
                setError('Ошибка удаления');
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Удалить пользователя?')) {
            const response = await authFetch(`/api/User/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setSuccess('Пользователь удалён');
                loadData();
            } else {
                setError('Ошибка удаления');
            }
        }
    };


    return (
        <>
            <Header />
            <div className="admin-page">
                <h1>Админ панель</h1>
                {error && <div className="admin-error">{error}</div>}
                {success && <div className="admin-success">{success}</div>}

                <div className="admin-tabs">
                    <button className={activeTab === 'tracks' ? 'active' : ''} onClick={() => setActiveTab('tracks')}>Треки</button>
                    <button className={activeTab === 'artists' ? 'active' : ''} onClick={() => setActiveTab('artists')}>Исполнители</button>
                    <button className={activeTab === 'albums' ? 'active' : ''} onClick={() => setActiveTab('albums')}>Альбомы</button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Пользователи</button>
                </div>

                <div className="admin-content">
                    {loading && <div>Загрузка...</div>}

                    {/* ТРЕКИ */}
                    {activeTab === 'tracks' && (
                        <div className="admin-section">
                            <div className="add-form">
                                <h3>Добавить трек</h3>
                                <input type="text" placeholder="Название" value={newTrack.name} onChange={(e) => setNewTrack({ ...newTrack, trackName: e.target.value })} />
                                <input type="text" placeholder="ID исполнителя" value={newTrack.artistId} onChange={(e) => setNewTrack({ ...newTrack, idArtist: e.target.value })} />
                                <input type="text" placeholder="ID альбома" value={newTrack.albumId} onChange={(e) => setNewTrack({ ...newTrack, idAlbum: e.target.value })} />
                                <input type="file" accept=".mp3" onChange={(e) => setNewTrack({ ...newTrack, file: e.target.files[0] })} />
                                <button onClick={handleAddTrack}>Добавить</button>
                            </div>
                            <div className="items-list">
                                {tracks.map(track => (
                                    <div key={track.idSong} className="admin-item">
                                        <span>{track.trackName}</span>
                                        <button className="delete-btn" onClick={() => handleDeleteTrack(track.idSong)}>Удалить</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ИСПОЛНИТЕЛИ */}
                    {activeTab === 'artists' && (
                        <div className="admin-section">
                            <div className="add-form">
                                <h3>Добавить исполнителя</h3>
                                <input type="text" placeholder="Имя" value={newArtist.name} onChange={(e) => setNewArtist({ ...newArtist, artistName: e.target.value })} />
                                <input type="text" placeholder="Описание" value={newArtist.bio} onChange={(e) => setNewArtist({ ...newArtist, artistDef: e.target.value })} />
                                <button onClick={handleAddArtist}>Добавить</button>
                            </div>
                            <div className="items-list">
                                {artists.map(artist => (
                                    <div key={artist.idArtist} className="admin-item">
                                        <span>{artist.artistName}</span>
                                        <button className="delete-btn" onClick={() => handleDeleteArtist(artist.idArtist)}>Удалить</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* АЛЬБОМЫ */}
                    {activeTab === 'albums' && (
                        <div className="admin-section">
                            <div className="add-form">
                                <h3>Добавить альбом</h3>
                                <input type="text" placeholder="Название" value={newAlbum.name} onChange={(e) => setNewAlbum({ ...newAlbum, albumName: e.target.value })} />
                                <input type="text" placeholder="ID исполнителя" value={newAlbum.artistId} onChange={(e) => setNewAlbum({ ...newAlbum, idArtist: e.target.value })} />
                                <input type="file" accept=".png" onChange={(e) => setNewAlbum({ ...newAlbum, picture: e.target.files[0] })} />
                                <button onClick={handleAddAlbum}>Добавить</button>
                            </div>
                            <div className="items-list">
                                {albums.map(album => (
                                    <div key={album.idAlbum} className="admin-item">
                                        <span>{album.albumName}</span>
                                        <button className="delete-btn" onClick={() => handleDeleteAlbum(album.idAlbum)}>Удалить</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ПОЛЬЗОВАТЕЛИ */}
                    {activeTab === 'users' && (
                        <div className="admin-section">
                            <div className="items-list">
                                {users.map(user => (
                                    <div key={user.idUser} className="admin-item">
                                        <span>{user.userName} (ID: {user.idUser})</span>
                                        <button className="delete-btn" onClick={() => handleDeleteUser(user.idUser)}>Удалить</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminPage;