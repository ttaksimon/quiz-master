import { Card, Form, Badge } from 'react-bootstrap';
import { FaClipboardList } from 'react-icons/fa';

/**
 * QuizInfoCard komponens - Kvíz alapinformációk megadása
 * 
 * Megjeleníti és kezeli a kvíz címét, leírását és a kérdések számát.
 * 
 * @param {Object} props - Komponens propjai
 * @param {string} props.title - Kvíz címe
 * @param {string} props.description - Kvíz leírása
 * @param {number} props.questionCount - Kérdések száma
 * @param {Function} props.onChange - Callback függvény az adatok változásakor (field, value)
 */
const QuizInfoCard = ({ title, description, questionCount, onChange }) => {
  return (
    <Card className="shadow-sm mb-3" style={{ borderRadius: '15px' }}>
      <Card.Header style={{
        backgroundColor: '#0d6efd',
        color: 'white',
        borderRadius: '15px 15px 0 0',
        padding: '15px 20px'
      }}>
        <h5 className="mb-0"><FaClipboardList className="me-2" />Kvíz információk</h5>
      </Card.Header>
      <Card.Body style={{ padding: '20px' }}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: '600' }}>Kvíz címe *</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Pl.: Történelem Kvíz"
            required
            minLength={3}
            style={{ borderRadius: '8px' }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: '600' }}>Leírás</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Rövid leírás a kvízről..."
            style={{ borderRadius: '8px' }}
          />
        </Form.Group>

        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '15px'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <span style={{ fontWeight: '600', color: '#6c757d' }}>Kérdések száma:</span>
            <Badge bg="primary" style={{ fontSize: '1rem', padding: '8px 15px' }}>
              {questionCount}
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuizInfoCard;
