import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaUser, FaCrown, FaCheck, FaLock, FaWandMagicSparkles } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';

/**
 * Felhasználói fiók információk megjelenítése
 * Megjeleníti a felhasználó alapvető adatait és a fiók kezelés gombokat
 */
const ProfileInfoCard = ({ user, onPasswordChange, onApiKeyManage }) => {
  return (
    <Card style={{
      border: '1px solid #dee2e6',
      borderRadius: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: '100%'
    }}>
      <Card.Header style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #f8f9fa',
        borderRadius: '15px 15px 0 0',
        padding: '20px 25px'
      }}>
        <h5 style={{ margin: 0, color: '#212529', fontWeight: '600' }}>
          <FaUser className="me-2" /> Fiók információk
        </h5>
      </Card.Header>
      <Card.Body style={{ padding: '25px' }}>
        {/* Felhasználónév */}
        <Row className="mb-3">
          <Col sm={4}>
            <strong style={{ color: '#6c757d' }}>Felhasználónév</strong>
          </Col>
          <Col sm={8}>
            <span style={{ color: '#212529' }}>{user?.username}</span>
          </Col>
        </Row>

        {/* Email */}
        <Row className="mb-3">
          <Col sm={4}>
            <strong style={{ color: '#6c757d' }}>Email</strong>
          </Col>
          <Col sm={8}>
            <span style={{ color: '#212529' }}>{user?.email}</span>
          </Col>
        </Row>

        {/* Jogosultság */}
        <Row className="mb-3">
          <Col sm={4}>
            <strong style={{ color: '#6c757d' }}>Jogosultság</strong>
          </Col>
          <Col sm={8}>
            {user?.is_admin ? (
              <Badge bg="danger" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                <FaCrown className="me-1" /> Admin
              </Badge>
            ) : (
              <Badge bg="primary" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                Felhasználó
              </Badge>
            )}
          </Col>
        </Row>

        {/* Fiók státusz */}
        <Row className="mb-3">
          <Col sm={4}>
            <strong style={{ color: '#6c757d' }}>Fiók státusz</strong>
          </Col>
          <Col sm={8}>
            <Badge bg={user?.is_active ? 'success' : 'danger'} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
              {user?.is_active ? (
                <><FaCheck className="me-1" /> Aktív</>
              ) : (
                <><FaTimes className="me-1" /> Inaktív</>
              )}
            </Badge>
          </Col>
        </Row>

        {/* Létrehozás dátuma */}
        <Row className="mb-3">
          <Col sm={4}>
            <strong style={{ color: '#6c757d' }}>Létrehozva</strong>
          </Col>
          <Col sm={8}>
            <span style={{ color: '#212529' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '-'}
            </span>
          </Col>
        </Row>

        <hr style={{ margin: '20px 0' }} />

        {/* Műveleti gombok */}
        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            size="lg"
            onClick={onPasswordChange}
            style={{
              borderRadius: '10px',
              fontWeight: '600',
              padding: '12px'
            }}
          >
            <FaLock className="me-2" /> Jelszó módosítása
          </Button>
          
          <div style={{ position: 'relative' }}>
            <Button
              variant={user?.has_gemini_api_key ? 'outline-success' : 'outline-secondary'}
              size="lg"
              onClick={onApiKeyManage}
              disabled={user?.subscription_plan === 'basic' && !user?.is_admin}
              style={{
                borderRadius: '10px',
                fontWeight: '600',
                padding: '12px',
                width: '100%'
              }}
            >
              {user?.has_gemini_api_key ? (
                <><FaCheck className="me-2" /> AI API Kulcs</>
              ) : (
                <><FaWandMagicSparkles className="me-2" /> AI API Kulcs beállítása</>
              )}
            </Button>
            {user?.subscription_plan === 'basic' && !user?.is_admin && (
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                Csak Prémium és Profi csomagok esetén
              </small>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileInfoCard;
