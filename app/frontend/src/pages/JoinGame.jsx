import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaQuestionCircle, FaTrophy, FaLightbulb } from 'react-icons/fa';

function JoinGame() {
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const code = gameCode.trim().toUpperCase();
    
    if (!code) {
      setError('Add meg a játék kódot!');
      return;
    }

    if (code.length !== 6) {
      setError('A játék kód 6 karakter hosszú!');
      return;
    }

    // Átirányítás a player oldalra
    navigate(`/game/play/${code}`);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h2 className="mb-0">Csatlakozás játékhoz</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="text-center text-muted mb-4">
                Add meg a 6 jegyű játék kódot, amit a játék gazdája (host) küldött neked!
              </p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Játék kód</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="ABC123"
                    value={gameCode}
                    onChange={(e) => {
                      setGameCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    maxLength={6}
                    size="lg"
                    className="text-center"
                    style={{ 
                      fontSize: '2rem', 
                      letterSpacing: '10px',
                      fontWeight: 'bold'
                    }}
                    autoFocus
                  />
                  <Form.Text className="text-muted">
                    A kód 6 karakter hosszú (betűk és számok)
                  </Form.Text>
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <div className="d-grid gap-2">
                  <Button 
                    variant="success" 
                    size="lg" 
                    type="submit"
                    disabled={!gameCode.trim()}
                  >
                    <FaPlay className="me-2" /> Tovább
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="text-muted small mb-0">
                  <FaLightbulb className="text-warning me-2" /><strong>Tipp:</strong> Kérd meg a host-ot, hogy ossza meg veled a játék kódot!
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Útmutató kártya */}
          <Card className="shadow-sm mt-4">
            <Card.Header className="bg-light">
              <strong><FaQuestionCircle className="me-2" />Hogyan működik?</strong>
            </Card.Header>
            <Card.Body>
              <ol className="mb-0">
                <li className="mb-2">Add meg a 6 jegyű játék kódot</li>
                <li className="mb-2">Válassz egy egyedi becenevet</li>
                <li className="mb-2">Válaszolj a kérdésekre időben</li>
                <li className="mb-2">Gyűjts pontokat és légy az első!</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default JoinGame;
