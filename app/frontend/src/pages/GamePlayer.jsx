import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import * as gameService from '../services/gameService';
import { rateQuiz } from '../services/quizService';

// Game komponensek importálása
import JoinGameForm from '../components/game/JoinGameForm';
import GameHeader from '../components/game/GameHeader';
import QuestionDisplay from '../components/game/QuestionDisplay';
import QuestionResultCard from '../components/game/QuestionResultCard';
import PlayerPositionCard from '../components/game/PlayerPositionCard';
import GameFinishedPanel from '../components/game/GameFinishedPanel';

function GamePlayer() {
  const { gameCode } = useParams();
  const wsRef = useRef(null);

  // Játékos állapot
  const [nickname, setNickname] = useState('');
  const [joined, setJoined] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  // Játék állapot
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Eredmények
  const [questionResults, setQuestionResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  
  // Értékelés
  const [quizId, setQuizId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');


  // Timer
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleJoinGame = () => {
    if (!nickname.trim()) {
      setConnectionError('Adj meg egy becenevet!');
      return;
    }

    const ws = gameService.createWebSocketConnection(gameCode, nickname.trim());
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket kapcsolat létrejött');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket hiba:', error);
      setConnectionError('Hiba történt a csatlakozás során');
    };

    ws.onclose = (event) => {
      if (event.code === 1008) {
        setConnectionError(event.reason || 'Nem sikerült csatlakozni');
        setJoined(false);
      }
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'connected':
        setJoined(true);
        setConnectionError('');
        // Azonnal lekérjük az aktuális kérdést (ha van)
        // Ez fontos a visszacsatlakozó játékosok számára
        fetchCurrentQuestion();
        break;

      case 'question_started':
        // Ha a WebSocket üzenet tartalmazza az időbélyeget, azonnal indítjuk a timert
        if (data.started_at && data.time_limit) {
          startTimer(data.started_at, data.time_limit);
        }
        // Mindenképp lekérjük a teljes kérdést
        fetchCurrentQuestion();
        setAnswerSubmitted(false);
        setSelectedAnswer(null);
        setQuestionResults(null);
        break;

      case 'question_finished':
        setQuestionResults(data.results);
        setLeaderboard(data.leaderboard);

        if (data.correct_answer) {
          setCurrentQuestion(prev => ({
            ...prev,
            correct_answer: data.correct_answer
          }));
        }

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        break;

      case 'game_finished':
        setLeaderboard(data.leaderboard);
        setGameFinished(true);
        setCurrentQuestion(null);
        if (data.quiz_id) {
          setQuizId(data.quiz_id);
        }
        break;

      default:
        break;
    }
  };

  const fetchCurrentQuestion = async () => {
    try {
      const data = await gameService.getCurrentQuestion(gameCode);
      if (data.question) {
        setCurrentQuestion({
          ...data.question,
          started_at: data.started_at, // Backend timestamp hozzáadása
          time_limit: data.question.time_limit
        });
        startTimer(data.started_at, data.question.time_limit);
        
        // Order típusnál inicializáljuk a selectedAnswer-t az eredeti indexekkel
        if (data.question.question_type === 'order' && data.question.options) {
          setSelectedAnswer(data.question.options.map((_, idx) => idx));
        }
      }
    } catch (err) {
      console.error('Hiba a kérdés lekérésekor:', err);
    }
  };

  const startTimer = (startedAt, timeLimit) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Szerver időbélyeg alapú számítás
    const startTime = new Date(startedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000; // másodpercben
      const remaining = Math.max(0, timeLimit - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(timerRef.current);
      }
    };

    // Azonnal frissítjük
    updateTimer();

    // Majd 100ms-enként
    timerRef.current = setInterval(updateTimer, 100);
  };

  const handleSubmitAnswer = () => {
    // Validate answer exists
    if (selectedAnswer === null || selectedAnswer === undefined) return;
    if (answerSubmitted) return;
    
    // For multiple choice, ensure at least one option is selected
    if (currentQuestion?.question_type === 'multiple_choice' && selectedAnswer.length === 0) return;

    // Format answer based on question type
    let formattedAnswer = selectedAnswer;
    
    if (currentQuestion?.question_type === 'multiple_choice' || currentQuestion?.question_type === 'order') {
      // Multiple choice és order esetén JSON string kell
      formattedAnswer = JSON.stringify(selectedAnswer);
    } else {
      // Single choice és number esetén string
      formattedAnswer = String(selectedAnswer);
    }

    wsRef.current.send(JSON.stringify({
      type: 'submit_answer',
      answer: formattedAnswer
    }));

    setAnswerSubmitted(true);
  };

  const handleRating = async (selectedRating) => {
    if (hasRated || !quizId) return;

    try {
      // Generate session ID for duplicate prevention
      const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await rateQuiz(quizId, selectedRating, sessionId);
      setRating(selectedRating);
      setHasRated(true);
      setRatingMessage('Köszönjük az értékelést!');
    } catch (error) {
      console.error('Rating error:', error);
      setRatingMessage('Hiba történt az értékelés során. Kérjük próbálja újra később.');
    }
  };

  const formatAnswer = (answer) => {
    if (!currentQuestion || !answer) return 'Nincs válasz';

    const questionType = currentQuestion.question_type;
    const options = currentQuestion.options || [];

    try {
      if (questionType === 'single_choice') {
        // Single choice: answer is an index as string
        const idx = parseInt(answer);
        return options[idx] || answer;
      } 
      else if (questionType === 'multiple_choice') {
        // Multiple choice: answer is a JSON array of indices
        const indices = JSON.parse(answer);
        if (Array.isArray(indices)) {
          return indices.map(idx => options[idx] || idx).join(', ');
        }
        return answer;
      } 
      else if (questionType === 'order') {
        // Order: answer is a JSON array representing the order
        const order = JSON.parse(answer);
        if (Array.isArray(order)) {
          return order.map((idx, position) => 
            `${position + 1}. ${options[idx] || idx}`
          ).join(' → ');
        }
        return answer;
      } 
      else if (questionType === 'number') {
        // Number: answer is a number as string
        return answer;
      }
    } catch (e) {
      // If parsing fails, return the raw answer
      return answer;
    }

    return answer;
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / currentQuestion?.time_limit) * 100;
    if (percentage > 66) return 'primary';
    if (percentage > 33) return 'warning';
    return 'danger';
  };

  const getTimerPercentage = () => {
    if (!currentQuestion) return 0;
    return (timeRemaining / currentQuestion.time_limit) * 100;
  };

  /** Kérdés megjelenítése komponens segítségével */
  const renderQuestionContent = () => {
    // Ha van eredmény, ne jelenjen meg a kérdés
    if (questionResults && questionResults[nickname]) {
      return null;
    }

    return (
      <QuestionDisplay
        currentQuestion={currentQuestion}
        timeRemaining={timeRemaining}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        answerSubmitted={answerSubmitted}
        onSubmitAnswer={handleSubmitAnswer}
        getTimerPercentage={getTimerPercentage}
        getTimerColor={getTimerColor}
      />
    );
  };

  // Csatlakozási képernyő
  if (!joined) {
    return (
      <JoinGameForm
        gameCode={gameCode}
        nickname={nickname}
        setNickname={setNickname}
        onJoin={handleJoinGame}
        connectionError={connectionError}
      />
    );
  }

  // Játék képernyő
  return (
    <Container className="mt-4">
      {/* Fejléc */}
      <GameHeader
        nickname={nickname}
        gameCode={gameCode}
        gameFinished={gameFinished}
      />

      <Row>
        {/* Kérdés terület */}
        <Col lg={8}>
          {renderQuestionContent()}

          {/* Kérdés eredményei - csak ha a játék még nem ért véget */}
          {!gameFinished && questionResults && questionResults[nickname] && (
            <QuestionResultCard
              isCorrect={questionResults[nickname].correct}
              playerAnswer={questionResults[nickname].answer}
              correctAnswer={currentQuestion?.correct_answer}
              formatAnswer={formatAnswer}
            />
          )}
        </Col>

        {/* Saját helyezés - csak akkor jelenik meg, ha van eredmény és a játék még nem ért véget */}
        <Col lg={4}>
          {!gameFinished && questionResults && questionResults[nickname] && leaderboard.length > 0 && (
            <PlayerPositionCard
              nickname={nickname}
              leaderboard={leaderboard}
            />
          )}
        </Col>
      </Row>

      {/* Játék vége */}
      {gameFinished && (
        <Row className="mt-4">
          {/* Bal oldal: Gratulálás + Értékelés */}
          <Col lg={8}>
            <GameFinishedPanel
              quizId={quizId}
              hasRated={hasRated}
              rating={rating}
              hoveredRating={hoveredRating}
              setHoveredRating={setHoveredRating}
              onRating={handleRating}
              ratingMessage={ratingMessage}
            />
          </Col>

          {/* Jobb oldal: Saját helyezés */}
          <Col lg={4}>
            {leaderboard.length > 0 && (
              <PlayerPositionCard
                nickname={nickname}
                leaderboard={leaderboard}
              />
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default GamePlayer;
