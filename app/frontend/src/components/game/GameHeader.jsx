import { Row, Col, Card, Badge } from 'react-bootstrap';
import { FaFlagCheckered } from 'react-icons/fa';

/**
 * Játék fejléc komponens
 * Megjeleníti a játékos nevét, a játék kódot és a játék állapotát
 */
const GameHeader = ({ nickname, gameCode, gameFinished }) => {
  return (
    <Row className="mb-4">
      <Col>
        <Card className="shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              {/* Bal oldal: Játékos neve és játék kód */}
              <div>
                <h4 className="mb-1">
                  Szia, <Badge bg="primary">{nickname}</Badge>!
                </h4>
                <div className="text-muted">
                  Játék kód: <strong>{gameCode}</strong>
                </div>
              </div>
              
              {/* Jobb oldal: Játék vége badge (ha vége van) */}
              {gameFinished && (
                <Badge bg="success" style={{ fontSize: '1.2rem' }}>
                  <FaFlagCheckered className="me-2" />Játék vége
                </Badge>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default GameHeader;
