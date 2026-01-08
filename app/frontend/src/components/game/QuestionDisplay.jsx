import { Card, Button, Form, Alert, ProgressBar, ListGroup, Badge } from 'react-bootstrap';
import { FaClipboardList, FaPaperPlane, FaCheck } from 'react-icons/fa';

/**
 * Kérdés megjelenítő komponens
 * Különböző kérdéstípusokat kezel: single_choice, multiple_choice, number, order
 */
const QuestionDisplay = ({
  currentQuestion,
  timeRemaining,
  selectedAnswer,
  setSelectedAnswer,
  answerSubmitted,
  onSubmitAnswer,
  getTimerPercentage,
  getTimerColor
}) => {
  // Ha nincs kérdés, akkor várakozó üzenetet jelenítünk meg
  if (!currentQuestion) {
    return (
      <Alert variant="info" className="text-center">
        <h5>Várakozás a következő kérdésre...</h5>
        <p className="mb-0">A host hamarosan elindítja a következő kérdést.</p>
      </Alert>
    );
  }

  const { question_type, question_text, options } = currentQuestion;

  return (
    <Card className="shadow-lg">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Kérdés</h5>
      </Card.Header>
      <Card.Body>
        {/* Kérdés szöveg */}
        <h4 className="mb-4">{question_text}</h4>

        {/* Timer */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Hátralévő idő</span>
            <strong>{Math.ceil(timeRemaining)}s</strong>
          </div>
          <ProgressBar 
            now={getTimerPercentage()} 
            variant={getTimerColor()}
            animated
            style={{ height: '25px' }}
          />
        </div>

        {/* Válaszok - típus alapján */}
        
        {/* Single choice - egy helyes válasz */}
        {question_type === 'single_choice' && (
          <div className="d-grid gap-2">
            {options?.map((option, idx) => (
              <Button
                key={idx}
                variant={selectedAnswer === idx ? 'primary' : 'outline-primary'}
                size="lg"
                onClick={() => setSelectedAnswer(idx)}
                disabled={answerSubmitted || timeRemaining <= 0}
                className="text-start"
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {/* Multiple choice - több helyes válasz */}
        {question_type === 'multiple_choice' && (
          <div className="d-grid gap-2">
            {options?.map((option, idx) => (
              <Form.Check
                key={idx}
                type="checkbox"
                id={`option-${idx}`}
                label={option}
                disabled={answerSubmitted || timeRemaining <= 0}
                checked={(selectedAnswer || []).includes(idx)}
                onChange={(e) => {
                  const current = selectedAnswer || [];
                  if (e.target.checked) {
                    setSelectedAnswer([...current, idx]);
                  } else {
                    setSelectedAnswer(current.filter(a => a !== idx));
                  }
                }}
                className="p-3 border rounded mb-2"
                style={{ fontSize: '1.1rem' }}
              />
            ))}
          </div>
        )}

        {/* Number - numerikus válasz */}
        {question_type === 'number' && (
          <Form.Control
            type="number"
            placeholder="Add meg a választ..."
            value={selectedAnswer || ''}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            disabled={answerSubmitted || timeRemaining <= 0}
            size="lg"
          />
        )}

        {/* Order - sorrendbe állítás */}
        {question_type === 'order' && (
          <div>
            <Alert variant="info" className="mb-3">
              <strong><FaClipboardList className="me-2" />Sorrendbe állítás:</strong> Használd a nyilakat a helyes sorrend beállításához!
            </Alert>
            <ListGroup>
              {selectedAnswer?.map((optionIdx, position) => (
                <ListGroup.Item 
                  key={position} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>
                    <Badge bg="primary" className="me-2">{position + 1}</Badge>
                    {options[optionIdx]}
                  </span>
                  <div>
                    {/* Fel gomb */}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-1"
                      disabled={position === 0 || answerSubmitted || timeRemaining <= 0}
                      onClick={() => {
                        const newOrder = [...selectedAnswer];
                        [newOrder[position], newOrder[position - 1]] = [newOrder[position - 1], newOrder[position]];
                        setSelectedAnswer(newOrder);
                      }}
                    >
                      ▲
                    </Button>
                    {/* Le gomb */}
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={position === selectedAnswer.length - 1 || answerSubmitted || timeRemaining <= 0}
                      onClick={() => {
                        const newOrder = [...selectedAnswer];
                        [newOrder[position], newOrder[position + 1]] = [newOrder[position + 1], newOrder[position]];
                        setSelectedAnswer(newOrder);
                      }}
                    >
                      ▼
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Beküldés gomb */}
        <div className="d-grid gap-2 mt-4">
          <Button
            variant="success"
            size="lg"
            onClick={onSubmitAnswer}
            disabled={
              selectedAnswer === null || 
              selectedAnswer === undefined || 
              (question_type === 'multiple_choice' && selectedAnswer?.length === 0) ||
              (question_type === 'number' && selectedAnswer === '') ||
              answerSubmitted || 
              timeRemaining <= 0
            }
          >
            {answerSubmitted ? <><FaCheck className="me-2" />Válasz beküldve</> : <><FaPaperPlane className="me-2" />Válasz beküldése</>}
          </Button>
        </div>

        {/* Beküldés visszajelzés */}
        {answerSubmitted && (
          <Alert variant="success" className="mt-3 mb-0">
            <FaCheck className="me-2" />Válaszod sikeresen beküldve! Várakozás az eredményekre...
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default QuestionDisplay;
