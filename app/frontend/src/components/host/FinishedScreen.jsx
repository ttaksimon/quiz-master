import { Container, Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaTrophy, FaFlagCheckered, FaFilePdf, FaFileExcel, FaCloudDownloadAlt } from 'react-icons/fa';
import { FaMedal } from 'react-icons/fa6';

/**
 * Befejezett játék képernyő komponens
 * Megjeleníti a végső ranglistát és exportálási lehetőségeket
 */
const FinishedScreen = ({ 
  leaderboard, 
  onExportPdf, 
  onExportExcel, 
  onBackToDashboard 
}) => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg text-center" style={{ borderRadius: '20px' }}>
            <Card.Body style={{ padding: '40px' }}>
              <h1 className="mb-4">
                <FaFlagCheckered className="me-3" />Játék véget ért!
              </h1>
              
              {/* Végső ranglista */}
              <Card className="mb-4">
                <Card.Header className="bg-success text-white">
                  <h4 className="mb-0">
                    <FaTrophy className="me-2" />Végső TOP 10
                  </h4>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Helyezés</th>
                        <th>Játékos</th>
                        <th>Pontszám</th>
                        <th>Helyes válaszok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.slice(0, 10).map((player, idx) => (
                        <tr 
                          key={idx}
                          style={{
                            backgroundColor: idx === 0 ? '#ffd70030' : 
                                           idx === 1 ? '#c0c0c030' : 
                                           idx === 2 ? '#cd7f3230' : 'transparent',
                            fontWeight: idx < 3 ? '600' : 'normal'
                          }}
                        >
                          <td style={{ fontSize: '1.5rem' }}>
                            {idx === 0 ? <FaTrophy className="text-warning" /> : 
                             idx === 1 ? <FaMedal className="text-secondary" /> : 
                             idx === 2 ? <FaMedal style={{ color: '#cd7f32' }} /> : 
                             `${idx + 1}.`}
                          </td>
                          <td>{player.nickname}</td>
                          <td>
                            <Badge bg="primary" style={{ fontSize: '1rem', padding: '8px 16px' }}>
                              {player.score} pont
                            </Badge>
                          </td>
                          <td>
                            {player.correct_answers} / {player.total_answers}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Exportálási lehetőségek */}
              <Card className="mb-4">
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">
                    <FaCloudDownloadAlt className="me-2" /> Eredmények letöltése
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted">
                    Mentsd le a játék eredményeit PDF vagy Excel formátumban!
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button variant="danger" size="lg" onClick={onExportPdf}>
                      <FaFilePdf className="me-2" /> PDF letöltése
                    </Button>
                    <Button variant="success" size="lg" onClick={onExportExcel}>
                      <FaFileExcel className="me-2" />Excel letöltése
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Vissza gomb */}
              <Button
                variant="outline-primary"
                size="lg"
                onClick={onBackToDashboard}
                style={{ padding: '15px 40px' }}
              >
                Vissza az Irányítópultra
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinishedScreen;
