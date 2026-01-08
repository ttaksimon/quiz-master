import { Card, Alert, Table, Button, Badge } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Függőben lévő csomag igénylések táblázat komponens
 * Admin jóváhagyásra/elutasításra váró igénylések megjelenítése
 */
const PendingRequestsTable = ({ 
  pendingRequests, 
  onApprove, 
  onReject, 
  getPlanBadge 
}) => {
  // Ha nincs igénylés
  if (pendingRequests.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Jóváhagyásra váró csomag igénylések</h5>
          <Alert variant="info">Jelenleg nincs függőben lévő igénylés.</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3">Jóváhagyásra váró csomag igénylések</h5>
        
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Felhasználónév</th>
                <th>Email</th>
                <th>Jelenlegi csomag</th>
                <th>Igényelt csomag</th>
                <th>Műveletek</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  {/* ID */}
                  <td>{request.id}</td>
                  
                  {/* Felhasználónév */}
                  <td>
                    <strong>{request.username}</strong>
                  </td>
                  
                  {/* Email */}
                  <td>{request.email}</td>
                  
                  {/* Jelenlegi csomag */}
                  <td>{getPlanBadge(request.subscription_plan)}</td>
                  
                  {/* Igényelt csomag */}
                  <td>
                    {getPlanBadge(request.requested_plan)}
                  </td>
                  
                  {/* Műveletek */}
                  <td>
                    <div className="d-flex gap-2">
                      {/* Jóváhagyás gomb */}
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => onApprove(request.id)}
                      >
                        <FaCheck className="me-1" />
                        Jóváhagy
                      </Button>
                      
                      {/* Elutasítás gomb */}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onReject(request.id)}
                      >
                        <FaTimes className="me-1" />
                        Elutasít
                      </Button>
                    </div>
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

export default PendingRequestsTable;
