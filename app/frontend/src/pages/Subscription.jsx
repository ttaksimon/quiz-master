import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaStar, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { requestSubscriptionUpgrade, cancelSubscriptionRequest } from '../services/authService';

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Periodikus felhasználói adatok frissítése
  useEffect(() => {
    // Azonnal frissítés az oldal betöltésekor
    refreshUser();

    // Frissítés 10 másodpercenként
    const interval = setInterval(() => {
      refreshUser();
    }, 10000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const plans = [
    {
      name: 'Alap',
      value: 'basic',
      price: 'Ingyenes',
      quizLimit: 5,
      features: [
        { text: 'Legfeljebb 5 kvíz', available: true },
        { text: 'Minden kérdéstípus', available: true },
        { text: 'AI válaszgenerálás', available: false },
        { text: 'Statisztikák a játék végén', available: true }
      ],
      color: 'secondary'
    },
    {
      name: 'Prémium',
      value: 'premium',
      price: '2990 Ft/hó',
      quizLimit: 15,
      features: [
        { text: 'Legfeljebb 15 kvíz', available: true },
        { text: 'Minden kérdéstípus', available: true },
        { text: 'AI válaszgenerálás', available: true },
        { text: 'Statisztikák a játék végén', available: true }
      ],
      color: 'primary',
      popular: true
    },
    {
      name: 'Profi',
      value: 'pro',
      price: '4990 Ft/hó',
      quizLimit: null,
      features: [
        { text: 'Korlátlan kvíz', available: true },
        { text: 'Minden kérdéstípus', available: true },
        { text: 'AI válaszgenerálás', available: true },
        { text: 'Statisztikák a játék végén', available: true }
      ],
      color: 'success'
    }
  ];

  const handleRequestUpgrade = async (planValue) => {
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await requestSubscriptionUpgrade(planValue);

    if (result.success) {
      setSuccess('Csomag igénylés elküldve! Az admin jóváhagyásra vár.');
      await refreshUser();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleCancelRequest = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await cancelSubscriptionRequest();

    if (result.success) {
      setSuccess('Igénylés sikeresen visszavonva.');
      await refreshUser();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getPlanName = (plan) => {
    const planMap = {
      basic: 'Alap',
      premium: 'Prémium',
      pro: 'Profi'
    };
    return planMap[plan] || plan;
  };

  const getStatusBadge = () => {
    if (user?.requested_plan) {
      return <Badge bg="warning" className="ms-2">Jóváhagyásra vár</Badge>;
    }
    return <Badge bg="success" className="ms-2">Aktív</Badge>;
  };

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">Előfizetési csomagok</h2>

      {/* Jelenlegi csomag */}
      <Card className="mb-4 shadow">
        <Card.Body>
          <h5>Jelenlegi csomagod:</h5>
          <h3 className="d-inline">
            {getPlanName(user?.subscription_plan)}
            {getStatusBadge()}
          </h3>
          
          <div className="mt-3">
            <p className="mb-1">
              <strong>Kvíz limit:</strong> {user?.quiz_limit || 'Korlátlan'}
            </p>
            {user?.requested_plan && (
              <Alert variant="info" className="mt-3 mb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>Igényelt csomag:</strong> {getPlanName(user.requested_plan)}
                    <br />
                    <small>Az admin felhasználó még nem hagyott jóvá/elutasított az igénylést.</small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleCancelRequest}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Visszavonás...
                      </>
                    ) : (
                      <><FaTimes className="me-1" /> Visszavonás</>
                    )}
                  </Button>
                </div>
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Elérhető csomagok */}
      <Row>
        {plans.map((plan) => (
          <Col key={plan.value} lg={4} md={6} className="mb-4">
            <Card 
              className={`h-100 shadow-sm ${plan.popular ? 'border-primary' : ''}`}
              style={{ position: 'relative' }}
            >
              {plan.popular && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '20px',
                    backgroundColor: '#0d6efd',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  <FaStar className="me-1" /> Népszerű
                </div>
              )}
              
              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-3">
                  <h4>{plan.name}</h4>
                </Card.Title>
                
                <div className="mb-3">
                  <h2 className={`text-${plan.color}`}>{plan.price}</h2>
                  <p className="text-muted">
                    {plan.quizLimit ? `${plan.quizLimit} kvíz` : 'Korlátlan kvíz'}
                  </p>
                </div>

                <ul className="list-unstyled mb-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-2">
                      {feature.available ? (
                        <FaCheck className="text-success me-2" />
                      ) : (
                        <FaTimes className="text-danger me-2" />
                      )}
                      <span style={{ color: feature.available ? 'inherit' : '#6c757d' }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {user?.subscription_plan === plan.value ? (
                    <Button variant={plan.color} disabled className="w-100">
                      Jelenlegi csomag
                    </Button>
                  ) : user?.requested_plan === plan.value ? (
                    <Button variant="warning" disabled className="w-100">
                      Jóváhagyásra vár
                    </Button>
                  ) : (
                    <Button
                      variant={`outline-${plan.color}`}
                      className="w-100"
                      onClick={() => handleRequestUpgrade(plan.value)}
                      disabled={loading || user?.requested_plan}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Igénylés...
                        </>
                      ) : (
                        'Csomag igénylése'
                      )}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Subscription;
