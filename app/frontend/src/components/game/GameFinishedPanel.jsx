import { Card, Badge, Alert } from 'react-bootstrap';
import { FaTrophy, FaStar } from 'react-icons/fa';

/**
 * Játék vége komponens
 * Gratulációs üzenet és kvíz értékelő felület
 */
const GameFinishedPanel = ({ 
  quizId, 
  hasRated, 
  rating, 
  hoveredRating, 
  setHoveredRating, 
  onRating, 
  ratingMessage 
}) => {
  return (
    <>
      {/* Gratulációs üzenet */}
      <Alert variant="success" className="text-center shadow-lg">
        <h3><FaTrophy className="text-warning me-2" />Gratulálunk a játék végéhez!</h3>
        <p className="mb-0">
          Köszönjük a részvételt! Nézd meg a végső ranglistát jobbra! →
        </p>
      </Alert>

      {/* Kvíz értékelés - csak ha van quiz ID */}
      {quizId && (
        <Card className="shadow mt-3">
          <Card.Body className="text-center">
            <h5 className="mb-3">Értékeld a kvízt!</h5>
            
            {!hasRated ? (
              <>
                {/* Csillagok megjelenítése */}
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => onRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      style={{
                        fontSize: '2.5rem',
                        cursor: 'pointer',
                        color: star <= (hoveredRating || rating) ? '#ffc107' : '#ddd',
                        transition: 'color 0.2s ease',
                        userSelect: 'none'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted mb-0">
                  Kattints a csillagokra az értékeléshez
                </p>
              </>
            ) : (
              // Sikeres értékelés üzenete
              <Alert variant="success" className="mb-0">
                {ratingMessage}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default GameFinishedPanel;
