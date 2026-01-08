import { Container, Row, Col, Card, ListGroup, Badge, Table, Button, Alert } from 'react-bootstrap';
import { FaTrophy, FaCheck, FaTimes, FaPlay, FaStop, FaLightbulb } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';

/**
 * Eredmények képernyő komponens
 * Megjeleníti egy kérdés eredményeit és a ranglistát
 */
const ResultsScreen = ({ 
  gameCode, 
  session, 
  leaderboard, 
  results, 
  error, 
  setError, 
  hasMoreQuestions, 
  onNextQuestion, 
  onFinishGame 
}) => {
  // Eredmények tömbként
  const resultsArray = results ? Object.entries(results).map(([nickname, data]) => ({
    nickname,
    ...data
  })).sort((a, b) => b.points - a.points) : [];

  return (
    <Container fluid className="mt-4">
      {/* Hibaüzenet */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Játék kód - jól látható */}
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm" style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            border: '3px solid #2196f3'
          }}>
            <Card.Body className="py-3">
              <Row className="align-items-center">
                {/* Bal oldal üres (spacer) */}
                <Col xs={3}></Col>
                
                {/* Középen a kód */}
                <Col xs={6} className="text-center">
                  <div style={{ fontSize: '0.9rem', color: '#1976d2', fontWeight: '600' }}>
                    Játék kód:
                  </div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800', 
                    letterSpacing: '10px',
                    fontFamily: 'monospace',
                    color: '#0d47a1'
                  }}>
                    {gameCode}
                  </div>
                </Col>
                
                {/* Jobb oldal a tipp */}
                <Col xs={3} className="d-flex justify-content-end">
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#555',
                    textAlign: 'left',
                    backgroundColor: 'white',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: '2px solid #2196f3',
                    maxWidth: '250px'
                  }}>
                    <strong><FaLightbulb className="text-warning me-2" />Tipp:</strong><br />
                    A játékosok ezzel a kóddal újra csatlakozhatnak!
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Kérdés címe */}
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-0">
                Kérdés {(session?.current_question_index || 0) + 1} eredményei
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Bal oldal: TOP 10 Ranglista */}
        <Col lg={6}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0"><FaTrophy className="me-2" />TOP 10 Ranglista</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <ListGroup variant="flush">
                {leaderboard.slice(0, 10).map((player, idx) => (
                  <ListGroup.Item 
                    key={idx}
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: idx === 0 ? '#ffd70030' : idx === 1 ? '#c0c0c030' : idx === 2 ? '#cd7f3230' : 'transparent',
                      fontWeight: idx < 3 ? '600' : 'normal'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: '1.3rem', minWidth: '30px' }}>
                        {idx === 0 ? <FaTrophy className="text-warning" /> : 
                         idx === 1 ? <FaMedal className="text-secondary" /> : 
                         idx === 2 ? <FaMedal style={{ color: '#cd7f32' }} /> : 
                         `${idx + 1}.`}
                      </span>
                      <span>{player.nickname}</span>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: '1.2rem' }}>
                        <strong>{player.score}</strong> pont
                      </div>
                      <small className="text-muted">
                        {player.correct_answers}/{player.total_answers} helyes
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Jobb oldal: Kérdés eredményei és vezérlő gombok */}
        <Col lg={6}>
          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Kérdés eredményei</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Játékos</th>
                    <th>Pontszám</th>
                    <th>Státusz</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsArray.map((result, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        backgroundColor: result.correct ? '#d4edda' : '#f8d7da'
                      }}
                    >
                      <td><strong>{result.nickname}</strong></td>
                      <td>
                        <Badge bg={result.correct ? 'success' : 'danger'} style={{ fontSize: '1rem' }}>
                          {result.points} pont
                        </Badge>
                      </td>
                      <td>
                        {result.correct ? (
                          <span className="text-success"><FaCheck className="me-1" />Helyes</span>
                        ) : (
                          <span className="text-danger"><FaTimes className="me-1" />Helytelen</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Vezérlő gombok */}
          <div className="d-grid gap-2">
            {hasMoreQuestions ? (
              <Button
                variant="success"
                size="lg"
                onClick={onNextQuestion}
                style={{ 
                  padding: '15px',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}
              >
                <FaPlay className="me-2" />Következő kérdés
              </Button>
            ) : (
              <Alert variant="info" className="mb-2">
                Nincs több kérdés! Fejezd be a játékot.
              </Alert>
            )}
            
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

export default ResultsScreen;
