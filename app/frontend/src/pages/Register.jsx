import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { register } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Kliens oldali validáció
    if (formData.password !== formData.passwordConfirm) {
      setError('A jelszavak nem egyeznek');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie');
      setLoading(false);
      return;
    }

    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.passwordConfirm
    );

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Regisztráció</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Sikeres regisztráció! Átirányítás a bejelentkezéshez...
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Felhasználónév</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Felhasználónév"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email cím</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="pelda@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Jelszó</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Jelszó (min. 8 karakter)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="passwordConfirm">
                  <Form.Label>Jelszó megerősítése</Form.Label>
                  <Form.Control
                    type="password"
                    name="passwordConfirm"
                    placeholder="Jelszó újra"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Regisztráció...' : 'Regisztráció'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Van már fiókod?{' '}
                  <Link to="/login">Jelentkezz be itt</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
