import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import * as gameService from '../services/gameService';

// Host komponensek importálása
import WaitingScreen from '../components/host/WaitingScreen';
import PlayingScreen from '../components/host/PlayingScreen';
import ResultsScreen from '../components/host/ResultsScreen';
import FinishedScreen from '../components/host/FinishedScreen';

function GameHost() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Játék fázisok: 'waiting', 'playing', 'results', 'finished'
  const [gamePhase, setGamePhase] = useState('waiting');

  // Session info betöltése
  useEffect(() => {
    // Ha a játék véget ért, ne pollolgassunk tovább
    if (gamePhase === 'finished') {
      return;
    }

    loadSessionInfo();
    const interval = setInterval(loadSessionInfo, 1000); // 1 másodpercenként
    return () => clearInterval(interval);
  }, [gameCode, gamePhase]);

  // Időzítő kezelése
  useEffect(() => {
    if (gamePhase === 'playing' && session?.current_question) {
      const questionStartTime = new Date(session.current_question.started_at).getTime();
      const questionDuration = session.current_question.time_limit * 1000;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - questionStartTime;
        const remaining = Math.max(0, Math.ceil((questionDuration - elapsed) / 1000));
        setTimeRemaining(remaining);
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [gamePhase, session]);

  const loadSessionInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await gameService.getSessionInfo(gameCode, token);
      setSession(data);
      setPlayers(data.players || []);
      setLeaderboard(data.leaderboard || []);
      
      // Fázis meghatározása
      if (data.status === 'finished') {
        setGamePhase('finished');
      } else if (data.question_finished && data.results) {
        setResults(data.results);
        setGamePhase('results');
      } else if (data.status === 'playing' && data.current_question) {
        setGamePhase('playing');
      } else {
        setGamePhase('waiting');
      }
      
      setLoading(false);
    } catch (err) {
      // Ha a játék már véget ért és a session nem létezik, ne dobjunk hibát
      if (gamePhase === 'finished') {
        console.log('Session már nem létezik (játék véget ért)');
        return;
      }
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!players || players.length === 0) {
      setError('Legalább 1 játékosnak csatlakoznia kell a játék indításához!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await gameService.startQuestion(gameCode, 0, token);
      setGamePhase('playing');
      setTimeout(loadSessionInfo, 400);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    
    const nextIndex = session.current_question_index + 1;
    
    if (nextIndex >= session.total_questions) {
      setError('Nincs több kérdés a kvízben.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await gameService.startQuestion(gameCode, nextIndex, token);
      setGamePhase('playing');
      setTimeout(loadSessionInfo, 400);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinishQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      await gameService.finishQuestion(gameCode, token);
      setGamePhase('results');
      await loadSessionInfo();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinishGame = async () => {
    try {
      const token = localStorage.getItem('token');
      await gameService.finishGame(gameCode, token);
      setGamePhase('finished');
      await loadSessionInfo();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportPdf = async () => {
    try {
      const token = localStorage.getItem('token');
      await gameService.exportToPdf(gameCode, token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      await gameService.exportToExcel(gameCode, token);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Betöltés...</p>
      </Container>
    );
  }

  if (error && !session) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/dashboard')}>Vissza az Irányítópultra</Button>
      </Container>
    );
  }

  // ===== 1. FÁZIS: VÁRAKOZÁS =====
  if (gamePhase === 'waiting') {
    return (
      <WaitingScreen
        gameCode={gameCode}
        players={players}
        error={error}
        onStartGame={handleStartGame}
        onBack={() => navigate('/dashboard')}
        setError={setError}
      />
    );
  }

  // ===== 2. FÁZIS: JÁTÉK MEGY =====
  if (gamePhase === 'playing') {
    return (
      <PlayingScreen
        session={session}
        currentQuestion={session?.current_question}
        timeRemaining={timeRemaining}
        players={players}
        error={error}
        setError={setError}
        onFinishQuestion={handleFinishQuestion}
        onFinishGame={handleFinishGame}
      />
    );
  }

  // ===== 3. FÁZIS: EREDMÉNYEK =====
  if (gamePhase === 'results') {
    const hasMoreQuestions = session && session.current_question_index < session.total_questions - 1;

    return (
      <ResultsScreen
        gameCode={gameCode}
        session={session}
        leaderboard={leaderboard}
        results={results}
        error={error}
        setError={setError}
        hasMoreQuestions={hasMoreQuestions}
        onNextQuestion={handleNextQuestion}
        onFinishGame={handleFinishGame}
      />
    );
  }

  // ===== 4. FÁZIS: VÉGEREDMÉNY =====
  if (gamePhase === 'finished') {
    return (
      <FinishedScreen
        leaderboard={leaderboard}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        onBackToDashboard={() => navigate('/dashboard')}
      />
    );
  }

  // Alapértelmezett fallback (ha valami hiba lenne)
  return (
    <Container className="mt-5 text-center">
      <Alert variant="warning">Érvénytelen játék állapot</Alert>
    </Container>
  );
}

export default GameHost;
