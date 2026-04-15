import { useState, useRef } from 'react';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
function LoginPage() { 
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/User/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: userName,
                    userPassword: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                setSuccess(data.message || 'Вход выполнен успешно');
                navigate('/');
            } else {
                setError(data.message || 'Ошибка входа');
            }
        } catch (err) {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };
    return (
        <><div className='mainHeader'>
            <h1 onClick={() => navigate('/')}>Только Музыка</h1>
        </div>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
        <div className= 'mainContent'>
            <div className= 'mainLogin'>
                <h1>Вход</h1>
                <h2>Введите имя пользователя:</h2>
                <input value={userName} onChange={(e) => setUserName(e.target.value)} name = "userName"></input>
                <h2>Введите Пароль:</h2>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} name = "password"/>
                <div className="showPassword">
                    <input type='checkbox' checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}></input>
                    <h2 style={{ marginTop: '0', width: 'max-content', paddingLeft:'1vw', height: '1.7vw' }} >Показать пароль</h2>
                </div>
                <button type="submit" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                </button>
            </div>
        </div>
        </form>
    </>); }
export default LoginPage;