import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinGame = () => {
    navigate('/game/join');
  };

  const handleCreateQuiz = () => {
    navigate('/quiz/create');
  };

  const handleMyQuizzes = () => {
    navigate('/my-quizzes');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      paddingTop: '60px',
      paddingBottom: '60px'
    }}>
      <Container>
        {/* Hero Section */}
        <Row className="justify-content-center text-center mb-5">
          <Col lg={10}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '60px 40px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid #dee2e6'
            }}>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: '700',
                color: '#0d6efd',
                marginBottom: '20px'
              }}>
                🎯 QuizMaster
              </h1>
              <p style={{
                fontSize: '1.5rem',
                color: '#6c757d',
                marginBottom: '40px',
                fontWeight: '400'
              }}>
                Interaktív kvízjáték platform valós időben
              </p>

              {/* Fő CTA - Játékhoz csatlakozás */}
              <div className="mb-4">
                <Button
                  onClick={handleJoinGame}
                  size="lg"
                  style={{
                    fontSize: '1.8rem',
                    padding: '20px 60px',
                    borderRadius: '50px',
                    backgroundColor: '#0d6efd',
                    border: 'none',
                    fontWeight: '600',
                    boxShadow: '0 6px 20px rgba(13, 110, 253, 0.3)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(13, 110, 253, 0.4)';
                    e.target.style.backgroundColor = '#0b5ed7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.3)';
                    e.target.style.backgroundColor = '#0d6efd';
                  }}
                >
                  Csatlakozás játékhoz
                </Button>
              </div>

              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                Van egy 6 jegyű kódod? Kezdd el a játékot most!
              </p>
            </div>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              padding: '30px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '20px' }}>
                ⚡
              </div>
              <h3 style={{ 
                textAlign: 'center', 
                color: '#0d6efd',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Valós idejű játék
              </h3>
              <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '1.05rem' }}>
                Versenyezz másokkal élőben! Gyorsasági bónuszok és élő ranglista.
              </p>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              padding: '30px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '20px' }}>
                📝
              </div>
              <h3 style={{ 
                textAlign: 'center', 
                color: '#0d6efd',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Saját kvízek
              </h3>
              <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '1.05rem' }}>
                Készíts egyedi kvízeket 4 különböző kérdéstípussal és testreszabható beállításokkal.
              </p>
            </Card>
          </Col>

          <Col md={4}>
            <Card style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #dee2e6',
              padding: '30px',
              height: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            >
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '20px' }}>
                🏆
              </div>
              <h3 style={{ 
                textAlign: 'center', 
                color: '#0d6efd',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Pontverseny
              </h3>
              <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '1.05rem' }}>
                Gyűjts pontokat, szerezz helyezést! Első 3 hely extra bónuszt kap.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Secondary Actions - csak bejelentkezett felhasználóknak */}
        {user && (
          <Row className="justify-content-center">
            <Col lg={10}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '40px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid #dee2e6',
                textAlign: 'center'
              }}>
                <h3 style={{ 
                  color: '#212529', 
                  marginBottom: '30px',
                  fontWeight: '600'
                }}>
                  Üdv, {user.username}!
                </h3>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Button
                    onClick={handleMyQuizzes}
                    size="lg"
                    style={{
                      padding: '15px 40px',
                      borderRadius: '30px',
                      backgroundColor: '#0d6efd',
                      border: 'none',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(13, 110, 253, 0.4)';
                      e.target.style.backgroundColor = '#0b5ed7';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
                      e.target.style.backgroundColor = '#0d6efd';
                    }}
                  >
                    Kvízeim
                  </Button>
                  <Button
                    onClick={handleCreateQuiz}
                    size="lg"
                    variant="success"
                    style={{
                      padding: '15px 40px',
                      borderRadius: '30px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(25, 135, 84, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.3)';
                    }}
                  >
                    Új kvíz készítése
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        )}

        {/* Info banner vendégeknek */}
        {!user && (
          <Row className="justify-content-center mt-4">
            <Col lg={10}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '25px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.1rem',
                  color: '#6c757d'
                }}>
                  <FaLightbulb className="text-warning me-2" /> <strong>Tipp:</strong> Jelentkezz be a menüsávban saját kvízek készítéséhez és játékok indításához!
                </p>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default HomePage;
