import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/mainPage';  // с большой буквы, без .jsx

function App() {
    return (  // ← добавил return
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />  // с большой буквы
            </Routes>
        </BrowserRouter>
    );
}

export default App;
