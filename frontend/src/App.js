import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import MainPage from './pages/mainPage'; 
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import ProfilePage from './pages/profilePage';
import AlbumDetail from './pages/albumDetail';


function App() {
    return (  
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} /> 
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} /> 
                <Route path="*" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
