import { Card, Badge } from 'react-bootstrap';
import { FaChartBar, FaTrophy, FaMedal } from 'react-icons/fa';

/**
 * Saját helyezés megjelenítő komponens
 * Megjeleníti a játékos aktuális helyezését a ranglistán
 */
const PlayerPositionCard = ({ nickname, leaderboard }) => {
  // Megkeressük a játékos pozícióját
  const myPosition = leaderboard.findIndex(p => p.nickname === nickname);
  const myData = leaderboard[myPosition];
  
  // Ha nincs adat, ne jelenjen meg semmi
  if (!myData) {
    return null;
  }

  return (
    <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0"><FaChartBar className="me-2" />A te helyezésed</h5>
      </Card.Header>
      <Card.Body>
        <div className="text-center py-4">
          {/* Helyezés száma */}
          <div className="display-3 fw-bold text-primary mb-3">
            {myPosition + 1}.
          </div>
          
          {/* Becenév */}
          <h4 className="mb-3">{myData.nickname}</h4>
          
          {/* Statisztikák */}
          <div className="d-flex justify-content-around mb-3">
            <div>
              <div className="text-muted small">Pontszám</div>
              <div className="h3 fw-bold">{myData.score}</div>
            </div>
            <div className="border-start"></div>
            <div>
              <div className="text-muted small">Helyes válaszok</div>
              <div className="h3 fw-bold">{myData.correct_answers}/{myData.total_answers}</div>
            </div>
          </div>
          
          {/* Helyezés badge-ek */}
          {myPosition === 0 && (
            <Badge bg="warning" className="fs-5 py-2 px-3">
              <FaTrophy className="me-2" />Első helyezett!
            </Badge>
          )}
          {myPosition === 1 && (
            <Badge bg="secondary" className="fs-5 py-2 px-3">
              <FaMedal className="me-2" />Második helyezett!
            </Badge>
          )}
          {myPosition === 2 && (
            <Badge bg="warning" text="dark" className="fs-5 py-2 px-3">
              <FaMedal className="me-2" />Harmadik helyezett!
            </Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlayerPositionCard;
