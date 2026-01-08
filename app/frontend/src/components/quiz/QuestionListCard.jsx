import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { FaPlus, FaQuestionCircle, FaTimes } from 'react-icons/fa';

/**
 * QuestionListCard komponens - Kérdések listája
 * 
 * Megjeleníti a kvíz kérdéseit, lehetővé teszi a kiválasztást, törlést és új kérdés hozzáadását.
 * 
 * @param {Object} props - Komponens propjai
 * @param {Array} props.questions - Kérdések tömbje
 * @param {number|null} props.selectedIndex - Kiválasztott kérdés indexe
 * @param {Function} props.onSelectQuestion - Callback függvény kérdés kiválasztásakor (index)
 * @param {Function} props.onRemoveQuestion - Callback függvény kérdés törlésekor (index)
 * @param {Function} props.onAddQuestion - Callback függvény új kérdés hozzáadásakor
 */
const QuestionListCard = ({ 
  questions, 
  selectedIndex, 
  onSelectQuestion, 
  onRemoveQuestion, 
  onAddQuestion 
}) => {
  /**
   * Kérdéstípus nevének lekérése
   */
  const getQuestionTypeName = (type) => {
    switch (type) {
      case 'single_choice': return 'Egyszeres';
      case 'multiple_choice': return 'Többszörös';
      case 'number': return 'Szám';
      case 'order': return 'Sorrend';
      default: return type;
    }
  };

  return (
    <Card className="shadow-sm" style={{ borderRadius: '15px' }}>
      <Card.Header style={{
        backgroundColor: '#6c757d',
        color: 'white',
        borderRadius: '15px 15px 0 0',
        padding: '15px 20px'
      }}>
        <h5 className="mb-0"><FaQuestionCircle className="me-2" />Kérdések</h5>
      </Card.Header>
      <Card.Body style={{ padding: '10px', maxHeight: '500px', overflowY: 'auto' }}>
        {questions.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>Még nincs kérdés hozzáadva</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {questions.map((question, index) => (
              <ListGroup.Item
                key={index}
                active={selectedIndex === index}
                onClick={() => onSelectQuestion(index)}
                style={{
                  borderRadius: '8px',
                  marginBottom: '5px',
                  cursor: 'pointer',
                  border: selectedIndex === index ? '2px solid #0d6efd' : '1px solid #dee2e6'
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                      {index + 1}. {question.question_text || 'Új kérdés'}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge bg="secondary" style={{ fontSize: '0.75rem' }}>
                        {getQuestionTypeName(question.question_type)}
                      </Badge>
                      <Badge bg="info" style={{ fontSize: '0.75rem' }}>
                        {question.time_limit}s
                      </Badge>
                      <Badge bg="warning" text="dark" style={{ fontSize: '0.75rem' }}>
                        {question.points} pont
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQuestion(index);
                    }}
                    style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <Button
          variant="outline-primary"
          type="button"
          onClick={onAddQuestion}
          className="w-100 mt-3"
          style={{ borderRadius: '8px', fontWeight: '600' }}
        >
          <FaPlus className="me-2" />Új kérdés hozzáadása
        </Button>
      </Card.Body>
    </Card>
  );
};

export default QuestionListCard;
