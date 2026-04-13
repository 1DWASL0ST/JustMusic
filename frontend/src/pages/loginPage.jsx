import { useState, useRef } from 'react';
import '../styles/global.css';

function LoginPage(){ 
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
                    <input type="password" style={{fontFamily: "Ubuntu"}} />
            </div>
        </div>
    </>); }
export default LoginPage;