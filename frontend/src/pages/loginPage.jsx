import { useState, useRef } from 'react';
import '../styles/global.css';

function LoginPage() { 
    const [showPassword, setShowPassword] = useState(false);
    return (
        <><div className='mainHeader'>
            <h1>Только Музыка</h1>
        </div>
        <div className= 'mainContent'>
            <div className= 'mainLogin'>
                <h1>Вход</h1>
                <h2>Введите идентификатор пользователя:</h2>
                <input></input>
                <h2>Введите Пароль:</h2>
                <input type={showPassword ? "text" : "password"}/>
                <div className="showPassword">
                    <input type='checkbox' checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}></input>
                    <h2 style={{ marginTop: '0', width: 'max-content', paddingLeft:'1vw', height: '1.7vw' }} >Показать пароль</h2>
                </div>
                <button>Войти</button>
            </div>
        </div>
    </>); }
export default LoginPage;