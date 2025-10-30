// PATTERN: React Router (Navigation)

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './Dashboard';
import UserProfile from './UserProfile';

const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/profile', element: <UserProfile /> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}

// PATTERN: React Router (Navigation)

import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

// PATTERN: React Router (Navigation)

import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/dashboard');
  };

  return <button onClick={handleLogin}>Login</button>;
}

// PATTERN: React Router (Navigation)

import { useParams } from 'react-router-dom';

export default function UserDetail() {
  const { userId } = useParams();
  
  return <h1>User ID: {userId}</h1>;
}

// PATTERN: React Router (Navigation)

import { useSearchParams } from 'react-router-dom';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  return <div>Search results for: {query}</div>;
}

// PATTERN: React Router (Navigation)

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// PATTERN: React Router (Navigation)

import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <Outlet />
    </div>
  );
}