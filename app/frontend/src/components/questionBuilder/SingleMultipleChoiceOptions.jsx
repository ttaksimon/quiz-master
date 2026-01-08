import { Row, Col, Form, Button } from 'react-bootstrap';
import AIMagicButton from './AIMagicButton';

/**
 * SingleMultipleChoiceOptions komponens - Egy vagy több helyes válasz kezelése
 * 
 * @param {Object} props - Komponens propjai
 * @param {string} props.questionType - 'single_choice' vagy 'multiple_choice'
 * @param {string} props.questionText - A kérdés szövege (AI generáláshoz)
 * @param {Array<string>} props.options - Válaszlehetőségek
 * @param {string} props.correctAnswer - Helyes válasz(ok) (single: "0", multiple: "[0,2]")
 * @param {number} props.index - Kérdés indexe
 * @param {boolean} props.hasApiKey - Van-e Gemini API kulcs
 * @param {Object} props.user - Felhasználó objektum (subscription_plan, is_admin ellenőrzéshez)
 * @param {Function} props.onOptionChange - Callback függvény válasz szöveg változásakor (idx, value)
 * @param {Function} props.onCorrectAnswerChange - Callback függvény helyes válasz változásakor (idx)
 * @param {Function} props.onAddOption - Callback függvény új válasz hozzáadásakor
 * @param {Function} props.onRemoveOption - Callback függvény válasz törlésekor (idx)
 * @param {Function} props.onAIAnswersGenerated - Callback függvény AI válaszok generálásakor (wrongAnswers)
 */
const SingleMultipleChoiceOptions = ({ 
  questionType,
  questionText,
  options, 
  correctAnswer, 
  index,
  hasApiKey,
  user,
  onOptionChange, 
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption,
  onAIAnswersGenerated
}) => {
  const isSingle = questionType === 'single_choice';
  
  return (
    <>
      <Form.Label>
        Válaszlehetőségek (2-4)
        {!isSingle && (
          <small className="text-muted ms-2">(Jelöld be az összes helyes választ!)</small>
        )}
      </Form.Label>
      
      {options.map((option, idx) => (
        <Row key={idx} className="mb-2">
          <Col xs={1}>
            <Form.Check
              type={isSingle ? 'radio' : 'checkbox'}
              name={`correct-${index}`}
              checked={
                isSingle
                  ? correctAnswer === idx.toString()
                  : JSON.parse(correctAnswer || '[]').includes(idx)
              }
              onChange={() => onCorrectAnswerChange(idx)}
            />
          </Col>
          <Col xs={9}>
            <Form.Control
              type="text"
              value={option}
              onChange={(e) => onOptionChange(idx, e.target.value)}
              placeholder={`${idx + 1}. válasz`}
              required
            />
          </Col>
          <Col xs={2}>
            {options.length > 2 && (
              <Button variant="outline-danger" size="sm" onClick={() => onRemoveOption(idx)}>
                ✕
              </Button>
            )}
          </Col>
        </Row>
      ))}

      {options.length < 4 && (
        <Button variant="outline-secondary" size="sm" onClick={onAddOption} className="mb-3">
          + Válasz hozzáadása
        </Button>
      )}

      {/* AI Varázsgomb csak egyszeres választásnál */}
      {isSingle && (
        <AIMagicButton
          questionText={questionText}
          correctAnswer={options[parseInt(correctAnswer)] || ''}
          onAnswersGenerated={onAIAnswersGenerated}
          hasApiKey={hasApiKey}
          user={user}
          numWrongAnswers={options.length - 1}
        />
      )}
    </>
  );
};

export default SingleMultipleChoiceOptions;
