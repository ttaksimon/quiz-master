import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaStar, FaEdit, FaTrash, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { IoLogoGameControllerB } from "react-icons/io";
import { useAuth } from '../context/AuthContext';
import * as quizService from '../services/quizService';
import * as gameService from '../services/gameService';
import RenderStars from '../components/RenderStars';

function MyQuizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Élő játék indítása modal
  const [showStartGameModal, setShowStartGameModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    loadMyQuizzes();
  }, []);

  const loadMyQuizzes = async () => {
    try {
      const data = await quizService.getMyQuizzes();
      setQuizzes(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('⚠️ Figyelem! Ez a művelet VÉGLEGESEN törli a kvízt az adatbázisból!\n\nA kvízzel együtt törlődnek:\n- Összes kérdés\n- Összes értékelés\n- Összes kapcsolódó adat\n\nEz a művelet NEM visszavonható!\n\nBiztosan folytatod a törlést?')) {
      return;
    }

    try {
      const result = await quizService.deleteQuiz(quizId);
      if (result.success) {
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartGameClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowStartGameModal(true);
  };

  const handleStartGame = async () => {
    if (!selectedQuiz) return;

    setStartingGame(true);
    try {
      const token = localStorage.getItem('token');
      const { game_code } = await gameService.createGame(selectedQuiz.id, token);
      
      // Átirányítás a host oldalra
      navigate(`/game/host/${game_code}`);
    } catch (err) {
      setError(err.message);
      setStartingGame(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Kvízek betöltése...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Kvízeim</h2>
            <Button as={Link} to="/quiz/create" variant="primary">
              <FaPlus className="me-2" /> Új kvíz létrehozása
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {quizzes.length === 0 ? (
        <Alert variant="info">
          <h5>Még nincs kvízed</h5>
          <p className="mb-0">
            Készítsd el az első kvízedet a <Link to="/quiz/create">Új kvíz létrehozása</Link> gombra kattintva!
          </p>
        </Alert>
      ) : (
        <Row>
          {quizzes.map((quiz) => (
            <Col key={quiz.id} md={6} lg={4} className="mb-4">
              <Card 
                className="h-100 shadow-sm"
                style={{
                  transition: 'box-shadow 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
              >
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    {quiz.is_active ? (
                      <Badge bg="success">Aktív</Badge>
                    ) : (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-inactive-${quiz.id}`}>
                            <strong>Inaktív kvíz</strong>
                            <br />
                            Ez a kvíz szabálysértés miatt inaktívvá lett téve az admin által.
                            <br />
                            További információért érdeklődjön az admin-nál.
                          </Tooltip>
                        }
                      >
                        <Badge bg="danger" style={{ cursor: 'help' }}>
                          <FaExclamationTriangle className="me-1" />
                          Inaktív
                        </Badge>
                      </OverlayTrigger>
                    )}
                    {quiz.is_public && (
                      <Badge bg="info" className="ms-2">Nyilvános</Badge>
                    )}
                  </div>

                  <Card.Title className="mb-2">{quiz.title}</Card.Title>
                  
                  <Card.Text className="text-muted small flex-grow-1">
                    {quiz.description || 'Nincs leírás'}
                  </Card.Text>

                  <div className="mb-3">
                    <div className="small text-muted">
                      <div>📝 {quiz.question_count || 0} kérdés</div>
                      <div>📅 Létrehozva: {new Date(quiz.created_at).toLocaleDateString('hu-HU')}</div>
                      <div>
                        <RenderStars rating={quiz.average_rating} totalRatings={quiz.total_ratings} />
                        {/* {renderStars(quiz.average_rating, quiz.total_ratings)} */}
                        {quiz.total_ratings > 0 && (
                          <span className="ms-1 text-muted">
                            ({quiz.total_ratings} értékelés)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="success" 
                      onClick={() => handleStartGameClick(quiz)}
                      disabled={!quiz.is_active || !quiz.question_count || quiz.question_count === 0}
                    >
                      <IoLogoGameControllerB className='me-1' /> Élő játék indítása
                    </Button>
                    
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        disabled={!quiz.is_active || !quiz.question_count}
                        onClick={() => navigate(`/quiz/edit/${quiz.id}`)}
                        className="flex-grow-1"
                      >
                        <FaEdit className="me-1" /> Szerkesztés
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={!quiz.is_active || !quiz.question_count || quiz.question_count === 0}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Élő játék indítása modal */}
      <Modal show={showStartGameModal} onHide={() => setShowStartGameModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Élő játék indítása</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuiz && (
            <>
              <p className="mb-3">
                Élő játékot indítasz a következő kvízzel:
              </p>
              <Card className="mb-3">
                <Card.Body>
                  <h5>{selectedQuiz.title}</h5>
                  <p className="text-muted mb-1">{selectedQuiz.description}</p>
                  <Badge bg="info">{selectedQuiz.question_count} kérdés</Badge>
                </Card.Body>
              </Card>
              <Alert variant="info">
                <strong><FaQuestionCircle className="me-2" />Hogyan működik?</strong>
                <ul className="mb-0 mt-2">
                  <li>Generálunk egy 6 jegyű játék kódot</li>
                  <li>Játékosok csatlakozhatnak a kóddal</li>
                  <li>Te irányítod a kérdéseket</li>
                  <li>Valós idejű ranglista</li>
                  <li>Gyorsasági bónusz pontok</li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStartGameModal(false)}>
            Mégse
          </Button>
          <Button 
            variant="success" 
            onClick={handleStartGame}
            disabled={startingGame}
          >
            {startingGame ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Indítás...
              </>
            ) : (
              'Játék indítása'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyQuizzes;
