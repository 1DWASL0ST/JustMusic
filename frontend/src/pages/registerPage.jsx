import { useState, useRef } from 'react';
import '../styles/global.css';

function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <><div className='mainHeader'>
            <h1>Только Музыка</h1>
        </div>
            <div className='mainContent'>
                <div className='mainLogin' style={{ height: '66vh'}}>
                    <h1>Регистрация</h1>
                    <h2>Введите имя пользователя:</h2>
                    <input></input>
                    <h2>Введите Пароль:</h2>
                    <input type={showPassword ? "text" : "password"} />
                    <h2>Повторите Пароль:</h2>
                    <input type={showPassword ? "text" : "password"} />
                    <div className="showPassword">
                        <input type='checkbox' checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)}></input>
                        <h2 style={{ marginTop: '0', width: 'max-content', paddingLeft: '1vw', height: '1.7vw' }} >Показать пароль</h2>
                    </div>
                    <button>Регистрация</button>
                </div>
            </div>
        </>);
}
export default RegisterPage;