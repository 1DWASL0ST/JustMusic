import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import MainPage from './pages/mainPage'; 
import LoginPage from './pages/loginPage';

function App() {
    return (  
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} /> 
                <Route path="/login" element={<LoginPage />} /> 
            </Routes>
        </BrowserRouter>
    );
}

export default App;
