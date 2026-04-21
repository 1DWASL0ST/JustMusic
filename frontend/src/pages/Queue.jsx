import '../styles/global.css';

function Queue({ queue, currentIndex, onSelectTrack }) {  

    const truncate = (text, maxLength = 40) => {
        if (!text) return 'Unknown';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    const handleTrackClick = (track, idx) => {
        if (onSelectTrack) {
            onSelectTrack(track, idx);
        }
    };


    return (
        <div className="queue">
            <h3>Очередь</h3>
            <div className="queue-list">
                {queue.map((track, idx) => (
                    <div
                        key={track.idSong}
                        className={`queue-item ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => handleTrackClick(track, idx)}  // ← добавить onClick
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="queue-bullet">
                            {idx === currentIndex && <div className="breathing-dot" />}
                        </div>
                        <div className="queue-info">
                            <span className="queue-artist">{truncate(track.artist?.artistName || 'Unknown', 25)}</span>
                            <span className="queue-separator"> — </span>
                            <span className="queue-title">{truncate(track.trackName, 35)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Queue;