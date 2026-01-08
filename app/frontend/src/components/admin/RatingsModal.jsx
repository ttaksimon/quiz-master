import { Modal, Spinner, Alert, Badge, Table, Button } from 'react-bootstrap';
import { FaStar, FaTrash } from 'react-icons/fa';
import RenderStars from '../RenderStars';

/**
 * Értékelések modal komponens
 * Megjeleníti egy kvíz összes értékelését és lehetőséget ad azok törlésére
 */
const RatingsModal = ({ 
  show, 
  onHide, 
  loading, 
  quizData, 
  onDeleteRating 
}) => {
  // Átlag számítás
  const average = quizData?.ratings?.length > 0 
    ? (quizData.ratings.reduce((sum, r) => sum + r.rating, 0) / quizData.ratings.length).toFixed(1)
    : 0;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaStar className="text-warning me-2" />
          Kvíz értékelései: {quizData?.quiz_title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Betöltés állapot */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Értékelések betöltése...</p>
          </div>
        ) : quizData?.ratings?.length === 0 ? (
          /* Nincs értékelés */
          <Alert variant="info">Még nincs értékelés ehhez a kvízhez.</Alert>
        ) : (
          <>
            {/* Statisztika */}
            <div className="mb-3">
              <strong>Átlag: </strong>
              <Badge bg="warning" text="dark" className="fs-6">
                <FaStar className="me-1" />
                {average}
              </Badge>
              <strong className="ms-3">Összesen: </strong>
              <Badge bg="primary" className="fs-6">
                {quizData?.ratings?.length || 0} db
              </Badge>
            </div>
            
            {/* Értékelések táblázat */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Értékelés</th>
                  <th>Session ID</th>
                  <th>Dátum</th>
                  <th>Művelet</th>
                </tr>
              </thead>
              <tbody>
                {quizData?.ratings?.map((rating, idx) => (
                  <tr key={rating.id}>
                    {/* Sorszám */}
                    <td>{idx + 1}</td>
                    
                    {/* Értékelés csillagokkal */}
                    <td>
                      <div style={{ fontSize: '1.2rem' }}>
                        <RenderStars rating={rating.rating} totalRatings={5} />
                        <span className="text-muted ms-2">({rating.rating}/5)</span>
                      </div>
                    </td>
                    
                    {/* Session ID */}
                    <td>
                      <small className="text-muted font-monospace">
                        {rating.session_id || 'N/A'}
                      </small>
                    </td>
                    
                    {/* Dátum */}
                    <td>
                      {new Date(rating.created_at).toLocaleString('hu-HU')}
                    </td>
                    
                    {/* Törlés gomb */}
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDeleteRating(rating.id)}
                      >
                        <FaTrash className="me-1" />
                        Törlés
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Bezárás
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RatingsModal;
