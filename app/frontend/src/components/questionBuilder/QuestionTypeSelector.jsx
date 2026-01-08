import { Form } from 'react-bootstrap';

/**
 * QuestionTypeSelector komponens - Kérdés típusának kiválasztása
 * 
 * @param {Object} props - Komponens propjai
 * @param {string} props.value - Aktuálisan kiválasztott típus
 * @param {Function} props.onChange - Callback függvény a típus változásakor
 */
const QuestionTypeSelector = ({ value, onChange }) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Kérdés típusa</Form.Label>
      <Form.Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="single_choice">Egy helyes válasz</option>
        <option value="multiple_choice">Több helyes válasz</option>
        <option value="number">Szám kérdés</option>
        <option value="order">Sorrend</option>
      </Form.Select>
    </Form.Group>
  );
};

export default QuestionTypeSelector;
