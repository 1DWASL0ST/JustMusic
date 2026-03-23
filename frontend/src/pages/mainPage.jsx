import React from 'react';
import '../styles/global.css';
import nextIcon from '../components/buttons/next.svg';
import playIcon from '../components/buttons/play.svg';

function MainPage() {
    return (
        <><div className='mainHeader'>
            <h1>Только Музыка</h1>
        </div>
        <div className='mainPart'>
            <div className='search'>
                <h1>Здесь будет поиск</h1>
            </div>
                <div className='mainPlayer'>
                <button className style={{ background: 'none', border: 'none' }}>
                        <img src={nextIcon} style={{ width: '80px', height: '120px', transform: 'rotate(180deg)'}} alt='prev'></img>
                </button>
                <div className='albumContainer'>
                    <img className='albumImage' alt=""></img>
                        <button style={{ background: 'none', border: 'none' }}>
                            <img src={playIcon} style={{ width: '135px', height: '135px',}} alt='play'></img>   
                        </button>
                </div>
                <button className style={{background: 'none',border: 'none'}}> 
                        <img src={nextIcon} style={{width: '80px', height: '120px',}} alt = 'next'></img>
                </button>
            </div>
            <div className='queue'>
                <h1>Здесь будет очередь</h1>
            </div>
        </div>
        </>
    );
}

export default MainPage;