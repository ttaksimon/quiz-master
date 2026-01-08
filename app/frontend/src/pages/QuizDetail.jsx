import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, Badge, ListGroup } from 'react-bootstrap';
import { FaStar, FaEdit, FaBullseye, FaClock } from 'react-icons/fa';
import * as quizService from '../services/quizService';

function QuizDetail() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const result = await quizService.getQuiz(quizId);
      if (result.success) {
        setQuiz(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Kvíz betöltése...</p>
      </Container>
    );
  }

  if (error || !quiz) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || 'Kvíz nem található'}</Alert>
        <Button onClick={() => navigate('/my-quizzes')}>Vissza a kvízekhez</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button 
        variant="outline-secondary" 
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Vissza
      </Button>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{quiz.title}</h3>
            <div>
              <Badge bg={quiz.is_active ? 'success' : 'secondary'} className="me-2">
                {quiz.is_active ? 'Aktív' : 'Inaktív'}
              </Badge>
              {quiz.is_public && (
                <Badge bg="info">Nyilvános</Badge>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Card.Text className="text-muted mb-3">
            {quiz.description || 'Nincs leírás'}
          </Card.Text>

          <div className="mb-3">
            <strong>Létrehozó:</strong> {quiz.creator?.username || 'Ismeretlen'}
          </div>

          <div className="mb-3">
            <strong>Létrehozva:</strong> {new Date(quiz.created_at).toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {quiz.average_rating > 0 && (
            <div className="mb-3">
              <strong>Értékelés:</strong> <FaStar className="text-warning" /> {quiz.average_rating.toFixed(1)} ({quiz.rating_count} értékelés)
            </div>
          )}

          <div className="d-flex gap-2 mt-4">
            <Button variant="primary" disabled>
              <FaBullseye className="me-1" /> Kvíz kitöltése (hamarosan)
            </Button>
            {quiz.creator_id === parseInt(localStorage.getItem('userId')) && (
              <Button 
                variant="outline-primary"
                onClick={() => navigate(`/quiz/edit/${quiz.id}`)}
              >
                <FaEdit className="me-1" /> Szerkesztés
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Kérdések előnézete */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Kérdések ({quiz.questions?.length || 0})</h5>
        </Card.Header>
        <Card.Body>
          {(!quiz.questions || quiz.questions.length === 0) ? (
            <Alert variant="info">Még nincsenek kérdések ebben a kvízben.</Alert>
          ) : (
            <ListGroup variant="flush">
              {quiz.questions.map((question, idx) => (
                <ListGroup.Item key={question.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <strong>{idx + 1}. {question.question_text}</strong>
                      <div className="small text-muted mt-1">
                        <Badge bg="secondary" className="me-2">
                          {question.question_type === 'single_choice' && 'Egy helyes válasz'}
                          {question.question_type === 'multiple_choice' && 'Több helyes válasz'}
                          {question.question_type === 'number' && 'Szám válasz'}
                          {question.question_type === 'order' && 'Sorrendbe állítás'}
                        </Badge>
                        {question.time_limit && (
                          <span><FaClock className="me-1" />{question.time_limit}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default QuizDetail;
