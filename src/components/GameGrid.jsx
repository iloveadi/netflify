import React from 'react';
import GameCard from './GameCard';
import './GameGrid.css';
import omokThumbnail from '../assets/omok_thumbnail.png';
import tetrisThumbnail from '../assets/tetris_thumbnail.png';

const games = [
    { id: 1, title: '오목', thumbnail: omokThumbnail, color: '#FF6B6B' },
    { id: 2, title: '지뢰찾기', thumbnail: '', color: '#4ECDC4' },
    { id: 3, title: '테트리스', thumbnail: tetrisThumbnail, color: '#45B7D1' },
    { id: 4, title: '스네이크', thumbnail: '/snake_thumbnail_neon.png', color: '#2ECC71' },
    { id: 5, title: '벽돌깨기', thumbnail: '', color: '#FFEEAD' },
    { id: 6, title: '2048', thumbnail: '', color: '#D4A5A5' },
    { id: 7, title: '카드 뒤집기', thumbnail: '', color: '#9B59B6' },
    { id: 8, title: '갤러그', thumbnail: '', color: '#3498DB' },
];

const GameGrid = () => {
    return (
        <div className="game-grid">
            {games.map((game) => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    );
};

export default GameGrid;
