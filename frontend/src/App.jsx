import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Elections from './pages/Elections.jsx';
import Vote from './pages/Vote.jsx';
import Results from './pages/Results.jsx';
import { CreateElection, AddCandidate } from './pages/Admin.jsx';

const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

function Private({ children, role }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const nav = useNavigate();
  const user = getUser();
  const logout = () => { localStorage.clear(); nav('/login'); };
  return (
    <>
      <header className="bar">
        <Link to="/"><b>🗳️ College Election</b></Link>
        {user && <span>{user.name} ({user.role}) <button onClick={logout}>Logout</button></span>}
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Private><Elections /></Private>} />
          <Route path="/elections/:id/vote" element={<Private role="student"><Vote /></Private>} />
          <Route path="/elections/new" element={<Private role="admin"><CreateElection /></Private>} />
          <Route path="/elections/:id/candidates" element={<Private role="admin"><AddCandidate /></Private>} />
          <Route path="/elections/:id/results" element={<Private role="admin"><Results /></Private>} />
        </Routes>
      </main>
    </>
  );
}