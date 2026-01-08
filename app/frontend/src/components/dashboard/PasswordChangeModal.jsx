import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa6';

/**
 * Jelszó módosítás modal komponens
 * Kezelés: jelszó validáció, form állapot, hiba és siker üzenetek
 */
const PasswordChangeModal = ({
  show,
  onHide,
  passwordData,
  setPasswordData,
  onSubmit,
  loading,
  error,
  success,
  setError,
  setSuccess
}) => {
  // Modal bezárása és állapot alaphelyzetbe állítása
  const handleClose = () => {
    onHide();
    setError('');
    setSuccess('');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton style={{ borderBottom: '2px solid #f8f9fa' }}>
        <Modal.Title>
          <FaLock className="me-2" /> Jelszó módosítása
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '25px' }}>
        {/* Hibaüzenet megjelenítése */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        
        {/* Sikeres üzenet megjelenítése */}
        {success && (
          <Alert variant="success">
            {success}
          </Alert>
        )}

        <Form onSubmit={onSubmit}>
          {/* Jelenlegi jelszó */}
          <Form.Group className="mb-3">
            <Form.Label>Jelenlegi jelszó</Form.Label>
            <Form.Control
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
              disabled={loading}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          {/* Új jelszó */}
          <Form.Group className="mb-3">
            <Form.Label>Új jelszó</Form.Label>
            <Form.Control
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
              minLength={8}
              disabled={loading}
              style={{ borderRadius: '8px' }}
            />
            <Form.Text className="text-muted">
              Minimum 8 karakter hosszú
            </Form.Text>
          </Form.Group>

          {/* Új jelszó megerősítése */}
          <Form.Group className="mb-4">
            <Form.Label>Új jelszó megerősítése</Form.Label>
            <Form.Control
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
              disabled={loading}
              style={{ borderRadius: '8px' }}
            />
          </Form.Group>

          {/* Műveleti gombok */}
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              size="lg"
              disabled={loading}
              style={{ borderRadius: '8px', fontWeight: '600' }}
            >
              {loading ? 'Mentés...' : 'Jelszó mentése'}
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
      </Modal.Body>
    </Modal>
  );
};

export default PasswordChangeModal;
