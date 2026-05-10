import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../api/api.js';
import { useAudio } from '../context/audioContext';
import '../styles/profile.css';
import editButton from '../components/buttons/edit.svg'
import GlobalPlayer from '../components/globalPlayer.jsx';

function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameLoading, setUsernameLoading] = useState(false);   
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const { playTrack } = useAudio();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            console.log('User ID from token:', userId);

            const response = await authFetch(`/api/User/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            setError('Не удалось загрузить профиль');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) {
            setError('Имя не может быть пустым');
            return;
        }
        
        setUsernameLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await authFetch(`/api/User/ChangeUserName/${user.idUser}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newUsername: newUsername.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess(data.message || 'Имя обновлено');
                setUser(prev => ({ ...prev, userName: newUsername }));
                setShowUsernameForm(false);
                setNewUsername('');
            } else {
                setError(data.message || 'Ошибка обновления имени');
            }
        } catch (error) {
            setError('Ошибка соединения');
        } finally {
            setUsernameLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают');
            return;
        }
        
        if (newPassword.length < 4) {
            setError('Пароль должен быть не менее 4 символов');
            return;
        }
        
        setPasswordLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await authFetch(`/api/User/ChangePassword/${user.idUser}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess(data.message || 'Пароль обновлён');
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Ошибка обновления пароля');
            }
        } catch (error) {
            setError('Ошибка соединения');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return <div className="profile-loading">Загрузка профиля...</div>;
    }

    if (!user) {
        return <div className="profile-error">Не удалось загрузить профиль</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="profile-back-btn" onClick={() => navigate('/')}>
                    ← На главную
                </button>
                <h1>Профиль</h1>
            </div>

            <div className="profile-info">
                <div className="info-item">
                    <span className="info-label">ID:</span>
                    <span className="info-value">{user.idUser}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Имя пользователя:</span>
                    <span className="info-value">{user.userName}</span>
                    <button 
                        className="profile-edit-btn"
                        onClick={() => setShowUsernameForm(!showUsernameForm)}
                    >
                        <img src={editButton} alt="edit" style={{ width: '40px', height: '40px' }} />
                    </button>
                </div>
            </div>

            {error && <div className="profile-error-msg">{error}</div>}
            {success && <div className="profile-success-msg">{success}</div>}

            {showUsernameForm && (
                <div className="profile-form">
                    <h3>Смена имени</h3>
                    <input
                        type="text"
                        placeholder="Новое имя"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <div className="profile-form-buttons">
                        <button onClick={handleUpdateUsername} disabled={usernameLoading}>
                            {usernameLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button onClick={() => setShowUsernameForm(false)}>Отмена</button>
                    </div>
                </div>
            )}

            {showPasswordForm && (
                <div className="profile-form">
                    <h3>Смена пароля</h3>
                    <input
                        type="password"
                        placeholder="Текущий пароль"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Подтвердите новый пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="profile-form-buttons">
                        <button onClick={handleUpdatePassword} disabled={passwordLoading}>
                            {passwordLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button onClick={() => setShowPasswordForm(false)}>Отмена</button>
                    </div>
                </div>
            )}

            {!showPasswordForm && (
                <button 
                    className="profile-change-password-btn"
                    onClick={() => setShowPasswordForm(true)}
                >
                    Сменить пароль
                </button>
            )}
            <GlobalPlayer />
        </div> 
    );
}

export default ProfilePage;