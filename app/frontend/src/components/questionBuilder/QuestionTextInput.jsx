import { Form } from 'react-bootstrap';

/**
 * QuestionTextInput komponens - Kérdés szövegének megadása
 * 
 * @param {Object} props - Komponens propjai
 * @param {string} props.value - Kérdés szövege
 * @param {Function} props.onChange - Callback függvény a szöveg változásakor
 */
const QuestionTextInput = ({ value, onChange }) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Kérdés szövege</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Írd be a kérdést..."
        required
      />
    </Form.Group>
  );
};

export default QuestionTextInput;
