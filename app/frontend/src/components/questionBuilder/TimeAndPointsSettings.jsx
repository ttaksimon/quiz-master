import { Row, Col, Form } from 'react-bootstrap';

/**
 * TimeAndPointsSettings komponens - Időkorlát, pontszám és bónusz beállítások
 * 
 * @param {Object} props - Komponens propjai
 * @param {number} props.timeLimit - Időkorlát másodpercben (5-300)
 * @param {number} props.points - Pontszám (1-100)
 * @param {boolean} props.speedBonus - Gyorsasági bónusz aktív-e
 * @param {number} props.index - Kérdés indexe (switch ID-hez)
 * @param {Function} props.onTimeChange - Callback függvény időkorlát változásakor
 * @param {Function} props.onPointsChange - Callback függvény pontszám változásakor
 * @param {Function} props.onSpeedBonusChange - Callback függvény bónusz változásakor
 */
const TimeAndPointsSettings = ({ 
  timeLimit, 
  points, 
  speedBonus, 
  index,
  onTimeChange, 
  onPointsChange, 
  onSpeedBonusChange 
}) => {
  return (
    <>
      {/* Időkorlát */}
      <Form.Group className="mb-3">
        <Form.Label>
          Időkorlát: <strong>{timeLimit}</strong> másodperc
        </Form.Label>
        <Form.Range
          min={5}
          max={300}
          value={timeLimit}
          onChange={(e) => onTimeChange(parseInt(e.target.value))}
        />
        <div className="d-flex justify-content-between text-muted small">
          <span>5 mp</span>
          <span>300 mp (5 perc)</span>
        </div>
      </Form.Group>

      {/* Pontszám és Bónusz */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Pontszám: <strong>{points || 10}</strong> pont
            </Form.Label>
            <Form.Range
              min={1}
              max={100}
              value={points || 10}
              onChange={(e) => onPointsChange(parseInt(e.target.value))}
            />
            <div className="d-flex justify-content-between text-muted small">
              <span>1 pont</span>
              <span>100 pont</span>
            </div>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Gyorsasági bónusz</Form.Label>
            <Form.Check
              type="switch"
              id={`speed-bonus-${index}`}
              label={speedBonus ? "Aktív (első 3 hely: +3, +2, +1)" : "Kikapcsolva"}
              checked={speedBonus !== undefined ? speedBonus : true}
              onChange={(e) => onSpeedBonusChange(e.target.checked)}
            />
            <Form.Text className="text-muted">
              Az első 3 helyes válasz extra pontot kap
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default TimeAndPointsSettings;
