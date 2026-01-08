import { Card, Alert, Table, Button, Badge, Form } from 'react-bootstrap';
import { FaEdit, FaStar, FaEye } from 'react-icons/fa';

/**
 * Kvízek táblázat komponens
 * Megjeleníti az összes kvízt admin szerkesztési lehetőségekkel
 */
const QuizzesTable = ({ 
  quizzes, 
  onEditQuiz, 
  onViewRatings, 
  onToggleActive 
}) => {
  // Ha nincs kvíz
  if (quizzes.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Felhasználók által készített kvízek</h5>
          <Alert variant="info">Még nincs egyetlen kvíz sem létrehozva.</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3">Felhasználók által készített kvízek</h5>
        
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Kvíz neve</th>
                <th>Készítő</th>
                <th>Kérdések</th>
                <th>Értékelés</th>
                <th>Státusz</th>
                <th>Létrehozva</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  {/* ID */}
                  <td>{quiz.id}</td>
                  
                  {/* Kvíz neve és szerkesztés gomb */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="flex-grow-1">
                        <strong>{quiz.title}</strong>
                        {quiz.description && (
                          <div className="text-muted small">{quiz.description}</div>
                        )}
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEditQuiz(quiz.id)}
                        title="Kvíz szerkesztése"
                      >
                        <FaEdit />
                      </Button>
                    </div>
                  </td>
                  
                  {/* Készítő */}
                  <td>
                    <Badge bg="info">{quiz.created_by_username || 'N/A'}</Badge>
                  </td>
                  
                  {/* Kérdések száma */}
                  <td className="text-center">
                    <Badge bg="primary">{quiz.question_count || 0}</Badge>
                  </td>
                  
                  {/* Értékelés */}
                  <td>
                    {quiz.average_rating > 0 ? (
                      <div className="d-flex align-items-center gap-2">
                        <div>
                          <span>
                            <FaStar className="text-warning me-1" />
                            {quiz.average_rating.toFixed(1)}
                          </span>
                          <div className="text-muted small">({quiz.total_ratings || 0} db)</div>
                        </div>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => onViewRatings(quiz.id)}
                          title="Értékelések megtekintése"
                        >
                          <FaEye />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  
                  {/* Státusz kapcsoló */}
                  <td className="text-center" style={{ minWidth: '130px' }}>
                    <Form.Select
                      size="sm"
                      value={quiz.is_active ? 'active' : 'inactive'}
                      onChange={(e) => {
                        const newStatus = e.target.value === 'active';
                        if (newStatus !== quiz.is_active) {
                          onToggleActive(quiz.id, quiz.is_active);
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        fontWeight: '500',
                        backgroundColor: quiz.is_active ? '#d1e7dd' : '#e2e3e5',
                        color: quiz.is_active ? '#0f5132' : '#41464b',
                        border: quiz.is_active ? '1px solid #badbcc' : '1px solid #c4c8cb'
                      }}
                    >
                      <option value="active">Aktív</option>
                      <option value="inactive">Inaktív</option>
                    </Form.Select>
                  </td>
                  
                  {/* Létrehozás dátuma */}
                  <td>
                    {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('hu-HU') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuizzesTable;
