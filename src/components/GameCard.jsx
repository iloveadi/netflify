import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ game }) => {
    // 오목(1), 테트리스(3)
    const isLink = game.id === 1 || game.id === 3;
    let linkPath = '#';
    if (game.id === 1) linkPath = '/omok';
    if (game.id === 3) linkPath = '/tetris';

    const CardContent = () => (
        <>
            <div
                className="thumbnail"
                style={{
                    backgroundColor: game.color || '#333',
                    backgroundImage: game.thumbnail ? `url(${game.thumbnail})` : 'none'
                }}
            >
                {!game.thumbnail && <span className="placeholder-icon">{game.title[0]}</span>}
            </div>
            <div className="info">
                <h3>{game.title}</h3>
                <button className="play-btn">PLAY</button>
            </div>
        </>
    );

    if (isLink) {
        return (
            <Link to={linkPath} className="game-card">
                <CardContent />
            </Link>
        );
    }

    return (
        <div className="game-card">
            <CardContent />
        </div>
    );
};

export default GameCard;
