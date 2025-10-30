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

import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/dashboard');
  };

  return <button onClick={handleLogin}>Login</button>;
}

import { useParams } from 'react-router-dom';

export default function UserDetail() {
  const { userId } = useParams();
  
  return <h1>User ID: {userId}</h1>;
}

import { useSearchParams } from 'react-router-dom';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  return <div>Search results for: {query}</div>;
}

import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div>
      <header>Dashboard Header</header>
      <Outlet />
    </div>
  );
}