import { Card } from 'react-bootstrap';
import { FaEdit, FaQuestionCircle } from 'react-icons/fa';
import QuestionBuilder from '../QuestionBuilder';

/**
 * QuestionEditorCard komponens - Kérdés szerkesztő felület
 * 
 * Megjeleníti a QuestionBuilder komponenst a kiválasztott kérdéshez,
 * vagy egy üres állapotot, ha nincs kiválasztva kérdés.
 * 
 * @param {Object} props - Komponens propjai
 * @param {Object|null} props.question - A szerkesztendő kérdés objektuma
 * @param {number|null} props.questionIndex - A kérdés indexe
 * @param {boolean} props.hasApiKey - Van-e Gemini API kulcs a felhasználónak
 * @param {Object} props.user - Felhasználó objektum (subscription_plan, is_admin ellenőrzéshez)
 * @param {Function} props.onQuestionChange - Callback függvény kérdés változásakor (updatedQuestion)
 * @param {Function} props.onQuestionRemove - Callback függvény kérdés törlésekor
 */
const QuestionEditorCard = ({ 
  question, 
  questionIndex, 
  hasApiKey,
  user,
  onQuestionChange, 
  onQuestionRemove 
}) => {
  // Ha nincs kiválasztva kérdés, üres állapotot jelenítünk meg
  if (question === null || questionIndex === null) {
    return (
      <Card className="shadow-sm" style={{ borderRadius: '15px' }}>
        <Card.Body className="text-center py-5">
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
            <FaQuestionCircle className="text-muted" />
          </div>
          <h4 style={{ color: '#6c757d', marginBottom: '15px' }}>
            Válassz ki egy kérdést a szerkesztéshez
          </h4>
          <p className="text-muted">
            Kattints egy kérdésre a bal oldali listából, vagy adj hozzá egy új kérdést
          </p>
        </Card.Body>
      </Card>
    );
  }

  // Ha van kiválasztott kérdés, megjeleníti a szerkesztő felületet
  return (
    <Card className="shadow-sm" style={{ borderRadius: '15px' }}>
      <Card.Header style={{
        backgroundColor: '#198754',
        color: 'white',
        borderRadius: '15px 15px 0 0',
        padding: '15px 20px'
      }}>
        <h5 className="mb-0">
          <FaEdit className="me-2" />{questionIndex + 1}. kérdés szerkesztése
        </h5>
      </Card.Header>
      <Card.Body style={{ padding: '25px' }}>
        <QuestionBuilder
          question={question}
          index={questionIndex}
          onChange={onQuestionChange}
          onRemove={onQuestionRemove}
          hasApiKey={hasApiKey}
          user={user}
        />
      </Card.Body>
    </Card>
  );
};

export default QuestionEditorCard;
