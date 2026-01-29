import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameGrid from './components/GameGrid';
import OmokGame from './games/omok/OmokGame';
import TetrisGame from './games/tetris/TetrisGame';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <>
              <header style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <h1 style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem',
                  background: 'linear-gradient(to right, var(--secondary-color), var(--accent-color))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '800'
                }}>
                  MINIGAME PORTAL
                </h1>
                <p style={{ color: '#888', fontSize: '1.2rem' }}>플레이할 게임을 선택하세요</p>
              </header>
              <main style={{ padding: '0 2rem 4rem' }}>
                <GameGrid />
              </main>
            </>
          } />
          <Route path="/omok" element={<OmokGame />} />
          <Route path="/tetris" element={<TetrisGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
