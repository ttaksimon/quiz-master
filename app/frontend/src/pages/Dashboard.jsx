import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword, cancelSubscriptionRequest } from '../services/authService';
import { updateApiKey, deleteApiKey } from '../services/quizService';

// Dashboard komponensek importálása
import PendingRequestAlert from '../components/dashboard/PendingRequestAlert';
import ProfileInfoCard from '../components/dashboard/ProfileInfoCard';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import PasswordChangeModal from '../components/dashboard/PasswordChangeModal';
import ApiKeyModal from '../components/dashboard/ApiKeyModal';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Jelszóváltoztatás állapotok
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // API kulcs kezelés állapotok
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState({ type: '', text: '' });
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  // Periodikus felhasználói adatok frissítése (10 másodpercenként)
  useEffect(() => {
    refreshUser(); // Azonnal frissítés betöltéskor
    const interval = setInterval(refreshUser, 10000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Előfizetési csomag igénylés visszavonása
   */
  const handleCancelRequest = async () => {
    if (!window.confirm('Biztosan visszavonod a csomag igénylésed?')) {
      return;
    }

    const result = await cancelSubscriptionRequest();
    
    if (result.success) {
      await refreshUser();
    } else {
      alert(result.error);
    }
  };

  /**
   * Előfizetési csomag magyar nevének lekérése
   */
  const getPlanName = (plan) => {
    const names = { basic: 'Alap', premium: 'Prémium', pro: 'Profi' };
    return names[plan] || plan;
  };

  /**
   * Előfizetési csomag színének meghatározása
   */
  const getPlanColor = (plan) => {
    const colors = { basic: 'secondary', premium: 'primary', pro: 'success' };
    return colors[plan] || 'secondary';
  };

  /**
   * Jelszó módosítás kezelése
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validáció: jelszavak egyezése
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Az új jelszavak nem egyeznek!');
      return;
    }

    // Validáció: jelszó minimum hossz
    if (passwordData.new_password.length < 8) {
      setPasswordError('Az új jelszónak legalább 8 karakter hosszúnak kell lennie!');
      return;
    }

    setLoading(true);
    const result = await changePassword(
      passwordData.current_password,
      passwordData.new_password,
      passwordData.confirm_password
    );
    setLoading(false);

    if (result.success) {
      setPasswordSuccess('Jelszó sikeresen megváltoztatva! Kijelentkezés...');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      
      // Kijelentkezés 1.5 másodperc múlva
      setTimeout(() => {
        setShowPasswordModal(false);
        logout();
        navigate('/login', { 
          state: { message: 'Jelszavad sikeresen megváltozott. Kérlek jelentkezz be az új jelszavaddal!' } 
        });
      }, 1500);
    } else {
      setPasswordError(result.error || 'Hiba történt a jelszó módosítása során');
    }
  };

  /**
   * API kulcs mentése
   */
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setApiKeyMessage({ type: '', text: '' });
    
    // Validáció: API kulcs minimum hossz
    if (!apiKey || apiKey.length < 10) {
      setApiKeyMessage({ type: 'danger', text: 'Kérlek, adj meg egy érvényes API kulcsot!' });
      return;
    }

    setApiKeyLoading(true);
    const result = await updateApiKey(apiKey);
    setApiKeyLoading(false);
    
    if (result.success) {
      setApiKeyMessage({ type: 'success', text: 'API kulcs sikeresen mentve!' });
      setApiKey('');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setApiKeyMessage({ type: 'danger', text: result.error });
    }
  };

  /**
   * API kulcs törlése
   */
  const handleDeleteApiKey = async () => {
    if (!window.confirm('Biztosan törölni szeretnéd az API kulcsot?')) {
      return;
    }

    setApiKeyLoading(true);
    const result = await deleteApiKey();
    setApiKeyLoading(false);
    
    if (result.success) {
      setApiKeyMessage({ type: 'success', text: 'API kulcs sikeresen törölve!' });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setApiKeyMessage({ type: 'danger', text: result.error });
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      paddingTop: '40px', 
      paddingBottom: '60px' 
    }}>
      <Container>
        {/* Üdvözlő fejléc */}
        <Row className="mb-4">
          <Col>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #dee2e6'
            }}>
              <h2 style={{ color: '#212529', fontWeight: '600', marginBottom: '10px' }}>
                Üdvözöllek, {user?.username}!
              </h2>
              <p style={{ color: '#6c757d', marginBottom: 0, fontSize: '1.1rem' }}>
                Itt kezelheted a fiókod és tekintheted meg az előfizetésed állapotát.
              </p>
            </div>
          </Col>
        </Row>

        {/* Függőben lévő csomag igénylés értesítés */}
        {user?.requested_plan && (
          <PendingRequestAlert 
            requestedPlan={user.requested_plan}
            onCancel={handleCancelRequest}
            getPlanName={getPlanName}
          />
        )}

        <Row>
          {/* Bal oldal - Fiók információk */}
          <Col lg={7} className="mb-4">
            <ProfileInfoCard 
              user={user}
              onPasswordChange={() => setShowPasswordModal(true)}
              onApiKeyManage={() => setShowApiKeyModal(true)}
            />
          </Col>

          {/* Jobb oldal - Előfizetés információk */}
          <Col lg={5} className="mb-4">
            <SubscriptionCard 
              user={user}
              getPlanName={getPlanName}
              getPlanColor={getPlanColor}
            />
          </Col>
        </Row>

        {/* Jelszó módosítás Modal */}
        <PasswordChangeModal 
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          onSubmit={handlePasswordChange}
          loading={loading}
          error={passwordError}
          success={passwordSuccess}
          setError={setPasswordError}
          setSuccess={setPasswordSuccess}
        />

        {/* Gemini API Kulcs Modal */}
        <ApiKeyModal 
          show={showApiKeyModal}
          onHide={() => setShowApiKeyModal(false)}
          user={user}
          apiKey={apiKey}
          setApiKey={setApiKey}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          onSave={handleSaveApiKey}
          onDelete={handleDeleteApiKey}
          loading={apiKeyLoading}
          message={apiKeyMessage}
          setMessage={setApiKeyMessage}
        />
      </Container>
    </div>
  );
};

export default Dashboard;
