import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: '700', fontSize: '1.3rem' }}>
          🎯 QuizMaster
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Kezdőlap
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/my-quizzes">
                  Kvízeim
                </Nav.Link>
                {!user?.is_admin && (
                  <Nav.Link as={Link} to="/subscription">
                    Csomagok
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/dashboard">
                  Irányítópult
                </Nav.Link>
                {user?.is_admin && (
                  <Nav.Link as={Link} to="/admin">
                    Admin beállítások
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-3">
                  Bejelentkezve: <strong>{user?.username}</strong>
                  {user?.is_admin && (
                    <span className="badge bg-danger ms-2">Admin</span>
                  )}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Kijelentkezés
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Bejelentkezés
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Regisztráció
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
