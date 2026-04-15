import { useState, useRef } from 'react';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        userPassword: '',
        repeatPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/User/Register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: formData.userName,
                    userPassword: formData.userPassword,
                    repeatPassword: formData.repeatPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Регистрация успешна!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
            else if (response.status === 400){
                setError(data.message || '400: Неверно введены данные');
            }
            else {
                setError(data.message || 'Ошибка регистрации');
            }
        }
        catch (err) {
            setError('Ошибка соединения с сервером');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <><div className='mainHeader'>
            <h1 onClick={() => navigate('/')}>Только Музыка</h1>
        </div>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
            <div className='mainContent'>
                <div className='mainLogin' style={{ height: '66vh'}}>
                    <h1>Регистрация</h1>
                    <h2>Введите имя пользователя:</h2>
                    <input onChange={handleChange} value={formData.userName} name="userName"></input>
                    <h2>Введите Пароль:</h2>
                    <input  name="userPassword" type={showPassword ? "text" : "password"} value={formData.userPassword} onChange={handleChange}/>
                    <h2>Повторите Пароль:</h2>
                    <input name="repeatPassword" type={showPassword ? "text" : "password"} value={formData.repeatPassword} onChange={handleChange} />
                    <div className="showPassword">
                        <input type='checkbox' checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}></input>
                        <h2 style={{ marginTop: '0', width: 'max-content', paddingLeft: '1vw', height: '1.7vw' }} >Показать пароль</h2>
                    </div>
                        <button type="submit" disabled={loading} >{loading ? 'Регистрация...' : 'Регистрация'}</button>
                </div>
            </div>
        </form>
        </>);
}
export default RegisterPage;