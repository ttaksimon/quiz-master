import { Container, Row, Col, Card, Badge, ListGroup, Button, Alert } from 'react-bootstrap';
import { FaCheck, FaPause, FaStop } from 'react-icons/fa';

/**
 * Aktív játék képernyő komponens
 * Megjeleníti az aktuális kérdést, hátralévő időt és válaszoló játékosokat
 */
const PlayingScreen = ({ 
  session, 
  currentQuestion, 
  timeRemaining, 
  players, 
  error, 
  setError, 
  onFinishQuestion, 
  onFinishGame 
}) => {
  // Még nem válaszolt játékosok szűrése
  const unansweredPlayers = players.filter(p => 
    !currentQuestion?.answers_received?.hasOwnProperty(p.nickname)
  );

  return (
    <Container fluid className="mt-4">
      {/* Hibaüzenet */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Fejléc - Kérdés számláló és időzítő */}
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                {/* Bal oldal: Kérdés számláló */}
                <div>
                  <h4 className="mb-1">
                    Kérdés {(session?.current_question_index || 0) + 1} / {session?.total_questions || 0}
                  </h4>
                  <Badge bg="danger" style={{ fontSize: '1.2rem', padding: '8px 16px' }}>
                    Játék folyamatban
                  </Badge>
                </div>
                
                {/* Jobb oldal: Időzítő */}
                <div className="text-center">
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700', 
                    color: timeRemaining <= 10 ? '#dc3545' : '#0d6efd' 
                  }}>
                    {timeRemaining}
                  </div>
                  <div className="text-muted">másodperc</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Kérdés szöveg */}
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body style={{ padding: '30px' }}>
              <h3 className="mb-0">
                {currentQuestion?.question_text || 'Kérdés betöltése...'}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Válaszra váró játékosok és vezérlő gombok */}
      <Row className="mb-3">
        {/* Bal oldal: Játékosok listája */}
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-warning">
              <h5 className="mb-0">
                Válaszra váró játékosok ({unansweredPlayers.length})
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {unansweredPlayers.length === 0 ? (
                <p className="text-success mb-0">
                  <FaCheck className="me-2" />Mindenki válaszolt!
                </p>
              ) : (
                <ListGroup variant="flush">
                  {unansweredPlayers.map((player, idx) => (
                    <ListGroup.Item 
                      key={idx}
                      className="d-flex align-items-center gap-2"
                    >
                      {/* Online/offline indikátor */}
                      <div 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: player.connected ? '#28a745' : '#dc3545'
                        }}
                      />
                      {player.nickname}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Jobb oldal: Vezérlő gombok */}
        <Col md={6}>
          <div className="d-grid gap-2">
            {/* Kérdés befejezése gomb */}
            <Button
              variant="warning"
              size="lg"
              onClick={onFinishQuestion}
              style={{ 
                padding: '15px',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              <FaPause className="me-2" />Kérdés befejezése
            </Button>
            
            {/* Játék befejezése gomb */}
            <Button
              variant="danger"
              size="lg"
              onClick={onFinishGame}
              style={{ 
                padding: '15px',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              <FaStop className="me-2" />Játék befejezése
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PlayingScreen;
