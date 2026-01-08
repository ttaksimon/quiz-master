import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavigationBar from './components/NavigationBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizDetail from './pages/QuizDetail';
import QuizCreateEdit from './pages/QuizCreateEdit';
import Subscription from './pages/Subscription';
import AdminPanel from './pages/AdminPanel';
import MyQuizzes from './pages/MyQuizzes';
import JoinGame from './pages/JoinGame';
import GameHost from './pages/GameHost';
import GamePlayer from './pages/GamePlayer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <NavigationBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <QuizDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/create"
              element={
                <ProtectedRoute>
                  <QuizCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/edit/:quizId"
              element={
                <ProtectedRoute>
                  <QuizCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-quizzes"
              element={
                <ProtectedRoute>
                  <MyQuizzes />
                </ProtectedRoute>
              }
            />
            <Route path="/game/join" element={<JoinGame />} />
            <Route path="/game/play/:gameCode" element={<GamePlayer />} />
            <Route
              path="/game/host/:gameCode"
              element={
                <ProtectedRoute>
                  <GameHost />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

