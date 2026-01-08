import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PiPackageFill } from "react-icons/pi";

/**
 * Előfizetés információk megjelenítése
 * Megjeleníti a felhasználó jelenlegi előfizetési csomagját és kvíz limitjét
 */
const SubscriptionCard = ({ user, getPlanName, getPlanColor }) => {
  return (
    <Card style={{
      border: '1px solid #dee2e6',
      borderRadius: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '20px',
      height: 'calc(100% - 20px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Card.Header style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #f8f9fa',
        borderRadius: '15px 15px 0 0',
        padding: '20px 25px'
      }}>
        <h5 style={{ margin: 0, color: '#212529', fontWeight: '600' }}>
          <PiPackageFill className='me-2' /> Előfizetés
        </h5>
      </Card.Header>
      <Card.Body style={{ 
        padding: '25px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1
      }}>
        <div>
          {/* Csomag neve */}
          <div style={{ marginBottom: '20px' }}>
            <Badge 
              bg={getPlanColor(user?.subscription_plan)} 
              style={{ 
                fontSize: '1.3rem', 
                padding: '12px 24px',
                borderRadius: '10px'
              }}
            >
              {user?.is_admin ? 'Admin' : getPlanName(user?.subscription_plan)}
            </Badge>
          </div>

          {/* Kvíz limit megjelenítés */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0d6efd', marginBottom: '5px' }}>
              {user?.quiz_limit === null || user?.is_admin ? '∞' : user?.quiz_limit}
            </div>
            <div style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              {user?.quiz_limit === null || user?.is_admin ? 'Korlátlan kvíz' : 'Kvíz limit'}
            </div>
          </div>
        </div>

        {/* Csomag váltás gomb - csak nem adminoknak */}
        {!user?.is_admin && (
          <Button
            as={Link}
            to="/subscription"
            variant="primary"
            size="lg"
            className="w-100"
            style={{
              borderRadius: '10px',
              fontWeight: '600',
              padding: '12px'
            }}
          >
            Csomag váltása
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default SubscriptionCard;
