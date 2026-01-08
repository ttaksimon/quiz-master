import { Table, Form, Badge } from 'react-bootstrap';
import { FaCrown, FaCheck } from 'react-icons/fa';

/**
 * Felhasználók táblázat komponens
 * Megjeleníti az összes felhasználót admin beállítási lehetőségekkel
 */
const UsersTable = ({ 
  users, 
  currentUserId, 
  editedUsers, 
  onToggleAdmin, 
  onChangePlan, 
  onToggleActive,
  getPlanBadge 
}) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Felhasználónév</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Csomag</th>
            <th>Aktív</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isCurrentUser = u.id === currentUserId;
            const edited = editedUsers[u.id] || {};
            
            return (
              <tr key={u.id} className={isCurrentUser ? 'table-info' : ''}>
                <td>{u.id}</td>
                
                {/* Felhasználónév */}
                <td>
                  {u.username}
                  {isCurrentUser && <Badge bg="info" className="ms-2">Te</Badge>}
                </td>
                
                {/* Email */}
                <td>{u.email}</td>
                
                {/* Admin jogosultság */}
                <td>
                  {isCurrentUser ? (
                    <Badge bg="danger">
                      <FaCrown className="me-1" />
                      Admin (Te)
                    </Badge>
                  ) : (
                    <Form.Select
                      size="sm"
                      value={edited.is_admin ? 'admin' : 'user'}
                      onChange={(e) => {
                        const newIsAdmin = e.target.value === 'admin';
                        if (newIsAdmin !== edited.is_admin) {
                          onToggleAdmin(u.id, edited.is_admin);
                        }
                      }}
                      style={{
                        backgroundColor: edited.is_admin ? '#f8d7da' : '#e2e3e5',
                        color: edited.is_admin ? '#842029' : '#41464b',
                        border: edited.is_admin ? '1px solid #f5c2c7' : '1px solid #c4c8cb',
                        fontWeight: '500'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  )}
                </td>
                
                {/* Csomag választó */}
                <td>
                  {edited.is_admin ? (
                    getPlanBadge('admin')
                  ) : (
                    <Form.Select
                      size="sm"
                      value={edited.subscription_plan}
                      onChange={(e) => {
                        const newPlan = e.target.value;
                        if (newPlan !== edited.subscription_plan) {
                          onChangePlan(u.id, newPlan);
                        }
                      }}
                      style={{
                        backgroundColor: 
                          edited.subscription_plan === 'basic' ? '#e2e3e5' :
                          edited.subscription_plan === 'premium' ? '#cfe2ff' :
                          edited.subscription_plan === 'pro' ? '#d1e7dd' : '#e2e3e5',
                        color: 
                          edited.subscription_plan === 'basic' ? '#41464b' :
                          edited.subscription_plan === 'premium' ? '#084298' :
                          edited.subscription_plan === 'pro' ? '#0f5132' : '#41464b',
                        border: 
                          edited.subscription_plan === 'basic' ? '1px solid #c4c8cb' :
                          edited.subscription_plan === 'premium' ? '1px solid #b6d4fe' :
                          edited.subscription_plan === 'pro' ? '1px solid #badbcc' : '1px solid #c4c8cb',
                        fontWeight: '500'
                      }}
                    >
                      <option value="basic">Alap</option>
                      <option value="premium">Prémium</option>
                      <option value="pro">Profi</option>
                    </Form.Select>
                  )}
                </td>
                
                {/* Aktív/Inaktív kapcsoló */}
                <td>
                  {isCurrentUser ? (
                    <Badge bg="success">
                      <FaCheck className="me-1" />
                      Aktív
                    </Badge>
                  ) : (
                    <Form.Select
                      size="sm"
                      value={edited.is_active ? 'active' : 'inactive'}
                      onChange={(e) => {
                        const newIsActive = e.target.value === 'active';
                        if (newIsActive !== edited.is_active) {
                          onToggleActive(u.id, edited.is_active);
                        }
                      }}
                      style={{
                        backgroundColor: edited.is_active ? '#d1e7dd' : '#e2e3e5',
                        color: edited.is_active ? '#0f5132' : '#41464b',
                        border: edited.is_active ? '1px solid #badbcc' : '1px solid #c4c8cb',
                        fontWeight: '500'
                      }}
                    >
                      <option value="active">Aktív</option>
                      <option value="inactive">Inaktív</option>
                    </Form.Select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default UsersTable;
