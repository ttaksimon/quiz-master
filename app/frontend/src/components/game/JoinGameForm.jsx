import { Container, Row, Col, Card, Form, Button, Badge, Alert } from 'react-bootstrap';

/**
 * Csatlakozási képernyő komponens
 * Megjeleníti a game code-ot és bekéri a játékos becenevét
 */
const JoinGameForm = ({ gameCode, nickname, setNickname, onJoin, connectionError }) => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white text-center">
              <h3 className="mb-0">Csatlakozás a játékhoz</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {/* Játék kód megjelenítése */}
              <div className="text-center mb-4">
                <h2>
                  <Badge bg="secondary" style={{ fontSize: '2rem', letterSpacing: '5px' }}>
                    {gameCode}
                  </Badge>
                </h2>
              </div>

              {/* Csatlakozási form */}
              <Form onSubmit={(e) => { e.preventDefault(); onJoin(); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Becenév</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Add meg a beceneved..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    size="lg"
                    maxLength={20}
                  />
                  <Form.Text className="text-muted">
                    Ez a név fog megjelenni a játék során
                  </Form.Text>
                </Form.Group>

                {/* Hibaüzenet megjelenítése */}
                {connectionError && (
                  <Alert variant="danger">{connectionError}</Alert>
                )}

                {/* Csatlakozás gomb */}
                <div className="d-grid">
                  <Button variant="primary" size="lg" type="submit">
                    Csatlakozás
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JoinGameForm;
