import { useState, useEffect } from 'react';
import { Container, Badge, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserByAdmin, approveSubscriptionRequest, rejectSubscriptionRequest, getPendingRequests } from '../services/authService';
import { getAllQuizzes, updateQuiz, getQuizRatings, deleteRating } from '../services/quizService';
import { FaUsers, FaBook, FaClipboardList } from 'react-icons/fa';

// Admin komponensek importálása
import UsersTable from '../components/admin/UsersTable';
import QuizzesTable from '../components/admin/QuizzesTable';
import PendingRequestsTable from '../components/admin/PendingRequestsTable';
import RatingsModal from '../components/admin/RatingsModal';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Szerkesztési állapotok - minden felhasználóhoz külön
  const [editedUsers, setEditedUsers] = useState({});
  
  const [activeTab, setActiveTab] = useState('users');
  
  // Értékelések modal állapotok
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [selectedQuizRatings, setSelectedQuizRatings] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      loadUsers();
      loadQuizzes();
      loadPendingRequests();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();

    if (result.success) {
      setUsers(result.data);
      // Inicializáljuk az editedUsers state-et
      const initial = {};
      result.data.forEach(u => {
        initial[u.id] = {
          is_admin: u.is_admin,
          subscription_plan: u.subscription_plan,
          is_active: u.is_active
        };
      });
      setEditedUsers(initial);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const loadQuizzes = async () => {
    const result = await getAllQuizzes();
    if (result.success) {
      setQuizzes(result.data);
    }
  };

  const loadPendingRequests = async () => {
    const result = await getPendingRequests();
    if (result.success) {
      setPendingRequests(result.data);
    }
  };

  const handleFieldChange = (userId, field, value) => {
    setEditedUsers(prev => {
      const updated = {
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: value
        }
      };
      
      // Ha admin jogosultságot adunk, automatikusan admin csomag legyen
      if (field === 'is_admin' && value === true) {
        updated[userId].subscription_plan = 'admin';
      }
      // Ha admin jogosultságot elveszünk, állítsuk vissza basic csomagra
      else if (field === 'is_admin' && value === false) {
        updated[userId].subscription_plan = 'basic';
      }
      
      return updated;
    });
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/quiz/edit/${quizId}`);
  };

  const handleToggleQuizActive = async (quizId, currentStatus) => {
    try {
      const result = await updateQuiz(quizId, { is_active: !currentStatus });
      if (result.success) {
        setSuccess(`Kvíz státusza frissítve: ${!currentStatus ? 'Aktív' : 'Inaktív'}`);
        await loadQuizzes();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Hiba történt a kvíz státuszának módosításakor');
    }
  };

  const handleToggleUserAdmin = async (userId, currentIsAdmin) => {
    const newIsAdmin = !currentIsAdmin;
    const updateData = {
      is_admin: newIsAdmin,
      subscription_plan: newIsAdmin ? 'admin' : 'basic',
      is_active: editedUsers[userId]?.is_active
    };
    
    const result = await updateUserByAdmin(userId, updateData);
    if (result.success) {
      setSuccess(`Admin jogosultság frissítve: ${newIsAdmin ? 'Admin' : 'User'}`);
      await loadUsers();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : JSON.stringify(result.error, null, 2);
      setError(errorMessage);
    }
  };

  const handleChangeUserPlan = async (userId, newPlan) => {
    const updateData = {
      is_admin: editedUsers[userId]?.is_admin,
      subscription_plan: newPlan,
      is_active: editedUsers[userId]?.is_active
    };
    
    const result = await updateUserByAdmin(userId, updateData);
    if (result.success) {
      setSuccess(`Csomag frissítve: ${newPlan}`);
      await loadUsers();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : JSON.stringify(result.error, null, 2);
      setError(errorMessage);
    }
  };

  const handleToggleUserActive = async (userId, currentIsActive) => {
    const newIsActive = !currentIsActive;
    const updateData = {
      is_admin: editedUsers[userId]?.is_admin,
      subscription_plan: editedUsers[userId]?.subscription_plan,
      is_active: newIsActive
    };
    
    const result = await updateUserByAdmin(userId, updateData);
    if (result.success) {
      setSuccess(`Felhasználó státusza frissítve: ${newIsActive ? 'Aktív' : 'Inaktív'}`);
      await loadUsers();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : JSON.stringify(result.error, null, 2);
      setError(errorMessage);
    }
  };

  const handleViewRatings = async (quizId) => {
    setLoadingRatings(true);
    setShowRatingsModal(true);
    setSelectedQuizRatings(null);
    
    const result = await getQuizRatings(quizId);
    if (result.success) {
      setSelectedQuizRatings(result.data);
    } else {
      setError(result.error);
    }
    
    setLoadingRatings(false);
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az értékelést?')) {
      return;
    }
    
    const result = await deleteRating(ratingId);
    if (result.success) {
      setSuccess('Értékelés sikeresen törölve!');
      // Frissítsük az értékelések listáját
      if (selectedQuizRatings) {
        await handleViewRatings(selectedQuizRatings.quiz_id);
      }
      // Frissítsük a kvízek listáját is
      await loadQuizzes();
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(result.error);
    }
  };

  const handleApproveRequest = async (userId) => {
    const result = await approveSubscriptionRequest(userId);
    if (result.success) {
      setSuccess('Igénylés jóváhagyva!');
      await loadUsers();
      await loadPendingRequests();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleRejectRequest = async (userId) => {
    const result = await rejectSubscriptionRequest(userId);
    if (result.success) {
      setSuccess('Igénylés elutasítva!');
      await loadUsers();
      await loadPendingRequests();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }
  };

  const getPlanBadge = (plan) => {
    const colors = {
      basic: 'secondary',
      premium: 'primary',
      pro: 'success',
      admin: 'danger'
    };
    const names = {
      basic: 'Alap',
      premium: 'Prémium',
      pro: 'Profi',
      admin: 'Admin'
    };
    return <Badge bg={colors[plan] || 'secondary'}>{names[plan] || plan}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      rejected: 'danger'
    };
    const names = {
      active: 'Aktív',
      pending: 'Függőben',
      rejected: 'Elutasítva'
    };
    return <Badge bg={colors[status]}>{names[status]}</Badge>;
  };

  if (!user?.is_admin) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Nincs jogosultságod ehhez az oldalhoz!
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Felhasználók betöltése...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <h2 className="mb-4">
        Admin Panel
      </h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        {/* Felhasználók kezelése TAB */}
        <Tab eventKey="users" title={<span><FaUsers className="me-2" />Felhasználók</span>}>
          <UsersTable
            users={users}
            currentUserId={user.id}
            editedUsers={editedUsers}
            onToggleAdmin={handleToggleUserAdmin}
            onChangePlan={handleChangeUserPlan}
            onToggleActive={handleToggleUserActive}
            getPlanBadge={getPlanBadge}
          />
        </Tab>

        {/* Összes kvíz TAB */}
        <Tab eventKey="quizzes" title={<span><FaBook className="me-2" />Összes kvíz</span>}>
          <QuizzesTable
            quizzes={quizzes}
            onEditQuiz={handleEditQuiz}
            onViewRatings={handleViewRatings}
            onToggleActive={handleToggleQuizActive}
          />
        </Tab>

        {/* Függőben lévő igénylések TAB */}
        <Tab 
          eventKey="pending" 
          title={
            <span>
              <FaClipboardList className="me-2" />
              Függőben lévő igénylések
              {pendingRequests.length > 0 && (
                <Badge bg="warning" className="ms-2">{pendingRequests.length}</Badge>
              )}
            </span>
          }
        >
          <PendingRequestsTable
            pendingRequests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            getPlanBadge={getPlanBadge}
          />
        </Tab>
      </Tabs>

      {/* Értékelések Modal */}
      <RatingsModal
        show={showRatingsModal}
        onHide={() => setShowRatingsModal(false)}
        loading={loadingRatings}
        quizData={selectedQuizRatings}
        onDeleteRating={handleDeleteRating}
      />
    </Container>
  );
};

export default AdminPanel;
