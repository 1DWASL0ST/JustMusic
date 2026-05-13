import React from 'react';
import { BrowserRouter, Routes, Route,useLocation } from 'react-router-dom';
import { AudioProvider } from './context/audioContext.jsx';
import MainPage from './pages/mainPage'; 
import LoginPage from './pages/loginPage';
import RegisterPage from './pages/registerPage';
import ProfilePage from './pages/profilePage';
import AlbumDetail from './pages/albumDetail';
import ArtistDetail from './pages/artistDetail.jsx';
import AdminPage from './pages/adminPage.jsx';




function App() {
    return (  
        <BrowserRouter>
            <AudioProvider>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<MainPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/album/:id" element={<AlbumDetail />} />
                    <Route path="/artist/:id" element={<ArtistDetail />} />
                    <Route path="/admin" element={<AdminPage/>} />
                </Routes>
            </AudioProvider>
        </BrowserRouter>
    );
}

export default App;
