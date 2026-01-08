import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaWandMagicSparkles, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa6';

/**
 * Gemini AI API kulcs kezelés modal komponens
 * Funkciók: API kulcs hozzáadása, meglévő kulcs törlése, kulcs láthatóság váltása
 */
const ApiKeyModal = ({
  show,
  onHide,
  user,
  apiKey,
  setApiKey,
  showApiKey,
  setShowApiKey,
  onSave,
  onDelete,
  loading,
  message,
  setMessage
}) => {
  // Modal bezárása és állapot tisztítása
  const handleClose = () => {
    onHide();
    setMessage({ type: '', text: '' });
    setApiKey('');
    setShowApiKey(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
        <Modal.Title>
          <FaWandMagicSparkles className="me-2" /> Gemini AI API Kulcs
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '25px' }}>
        {/* Leírás */}
        <p className="text-muted mb-3">
          Az AI funkciók használatához szükséges egy Gemini API kulcs.
          Ezzel automatikusan generálhatsz rossz válaszokat a kvíz kérdéseidhez.
        </p>

        {/* Üzenetek megjelenítése */}
        {message.text && (
          <Alert 
            variant={message.type} 
            onClose={() => setMessage({ type: '', text: '' })} 
            dismissible
          >
            {message.text}
          </Alert>
        )}

        {/* Ellenőrzés: csak prémium, profi csomagok és admin felhasználók esetén */}
        {user?.subscription_plan === 'basic' && !user?.is_admin ? (
          <div>
            <Alert variant="warning" className="mb-3">
              <strong>⚠️ Ez a funkció nem érhető el az Alap csomagban</strong>
              <p className="mb-0 mt-2">
                A Gemini AI funkciók használata csak a <strong>Prémium</strong> és <strong>Profi</strong> csomagok esetén érhető el.
              </p>
            </Alert>
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                onClick={handleClose}
                style={{ borderRadius: '8px', fontWeight: '600' }}
              >
                Értettem
              </Button>
            </div>
          </div>
        ) : user?.has_gemini_api_key ? (
          /* Ha van már API kulcs */
          <div>
            <Alert variant="success" className="mb-3">
              <strong><FaCheck className="me-1" /> API kulcs beállítva!</strong> Az AI funkciók elérhetők.
            </Alert>
            <div className="d-grid gap-2">
              <Button 
                variant="danger" 
                onClick={onDelete}
                disabled={loading}
                style={{ borderRadius: '8px', fontWeight: '600' }}
              >
                {loading ? (
                  <><Spinner animation="border" size="sm" className="me-2" />Törlés...</>
                ) : (
                  'API Kulcs törlése'
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                disabled={loading}
                style={{ borderRadius: '8px' }}
              >
                Bezárás
              </Button>
            </div>
          </div>
        ) : (
          /* API kulcs hozzáadása form */
          <Form onSubmit={onSave}>
            <Alert variant="info" className="mb-3">
              <strong>Még nincs API kulcs beállítva.</strong>
              <br />
              Szerezz be egy ingyenes API kulcsot: 
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ms-2"
                style={{ color: '#0d6efd', fontWeight: '600' }}
              >
                Google AI Studio →
              </a>
            </Alert>

            {/* API kulcs beviteli mező */}
            <Form.Group className="mb-3">
              <Form.Label>Gemini API Kulcs</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type={showApiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  minLength={10}
                  style={{ borderRadius: '8px' }}
                  disabled={loading}
                />
                {/* Láthatóság váltás gomb */}
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={loading}
                  style={{ borderRadius: '8px', minWidth: '48px' }}
                >
                  {showApiKey ? <FaEye /> : <FaEyeSlash />}
                </Button>
              </div>
              <Form.Text className="text-muted">
                Az API kulcsod biztonságosan tárolva lesz.
              </Form.Text>
            </Form.Group>

            {/* Műveleti gombok */}
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
                size="lg"
                style={{ borderRadius: '8px', fontWeight: '600' }}
              >
                {loading ? (
                  <><Spinner animation="border" size="sm" className="me-2" />Mentés...</>
                ) : (
                  'API Kulcs mentése'
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                disabled={loading}
                style={{ borderRadius: '8px' }}
              >
                Mégse
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ApiKeyModal;
