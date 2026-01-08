import { Card } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Kérdés eredmény komponens
 * Megjeleníti a helyes/helytelen választ
 */
const QuestionResultCard = ({ isCorrect, playerAnswer, correctAnswer, formatAnswer }) => {
  if (isCorrect) {
    // Helyes válasz esetén
    return (
      <Card className="shadow-sm mt-3">
        <Card.Header className="bg-success text-white">
          <h5 className="mb-0"><FaCheck className="me-2" />Helyes válasz!</h5>
        </Card.Header>
        <Card.Body>
          <div>
            <strong className="text-success">A helyes válasz:</strong>
            <div className="mt-1 p-3 bg-success bg-opacity-10 rounded border border-success">
              {formatAnswer(playerAnswer)}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Helytelen válasz esetén
  return (
    <Card className="shadow-sm mt-3">
      <Card.Header className="bg-danger text-white">
        <h5 className="mb-0"><FaTimes className="me-2" />Helytelen válasz</h5>
      </Card.Header>
      <Card.Body>
        {/* A játékos válasza */}
        <div className="mb-3">
          <strong className="text-danger">A te válaszod:</strong>
          <div className="mt-1 p-2 bg-danger bg-opacity-10 rounded border border-danger">
            {formatAnswer(playerAnswer)}
          </div>
        </div>
        
        {/* A helyes válasz */}
        <div>
          <strong className="text-success">A helyes válasz:</strong>
          <div className="mt-1 p-2 bg-success bg-opacity-10 rounded border border-success">
            {formatAnswer(correctAnswer)}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuestionResultCard;
