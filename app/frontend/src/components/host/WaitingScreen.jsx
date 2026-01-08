import { Container, Row, Col, Card, ListGroup, Button, Alert } from 'react-bootstrap';

/**
 * Várakozási képernyő komponens
 * Megjeleníti a game code-ot és a csatlakozott játékosokat
 */
const WaitingScreen = ({ 
  gameCode, 
  players, 
  error, 
  onStartGame, 
  onBack, 
  setError 
}) => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg text-center" style={{ borderRadius: '20px' }}>
            <Card.Body style={{ padding: '40px' }}>
              <h2 className="mb-4">Játékosok várakozása</h2>
              
              {/* Játék kód megjelenítése */}
              <div className="mb-4" style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                border: '3px solid #2196f3',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.2)'
              }}>
                <div className="mb-2" style={{ 
                  fontSize: '1.2rem', 
                  color: '#1976d2',
                  fontWeight: '600'
                }}>
                  Játék kód:
                </div>
                <div style={{ 
                  fontSize: '4rem', 
                  fontWeight: '800', 
                  letterSpacing: '15px',
                  fontFamily: 'monospace',
                  color: '#0d47a1',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {gameCode}
                </div>
              </div>

              {/* Hibaüzenet */}
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Csatlakozott játékosok */}
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    Csatlakozott játékosok ({players.length})
                  </h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {players.length === 0 ? (
                    <p className="text-muted">Nincs még csatlakozott játékos...</p>
                  ) : (
                    <ListGroup variant="flush">
                      {players.map((player, idx) => (
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
                          <strong>{player.nickname}</strong>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>

              {/* Akció gombok */}
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={onStartGame}
                  disabled={players.length === 0}
                  style={{ 
                    padding: '15px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    borderRadius: '10px'
                  }}
                >
                  Játék indítása
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={onBack}
                >
                  Vissza
                </Button>
              </div>

              {/* Info üzenet */}
              {players.length === 0 && (
                <Alert variant="info" className="mt-3 mb-0">
                  Várd meg, hogy csatlakozzanak a játékosok a <strong>{gameCode}</strong> kóddal!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default WaitingScreen;
