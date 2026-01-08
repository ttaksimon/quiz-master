import { Form } from 'react-bootstrap';

/**
 * NumberQuestionInput komponens - Szám típusú kérdés helyes válaszának megadása
 * 
 * @param {Object} props - Komponens propjai
 * @param {string|number} props.value - Helyes válasz (szám)
 * @param {Function} props.onChange - Callback függvény érték változásakor
 */
const NumberQuestionInput = ({ value, onChange }) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>Helyes válasz (szám)</Form.Label>
      <Form.Control
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pl.: 42 vagy 3.14"
        required
      />
      <Form.Text className="text-muted">
        Csak a helyesen válaszoló játékosok kapnak pontot.
      </Form.Text>
    </Form.Group>
  );
};

export default NumberQuestionInput;
