import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthorDetailPage } from './pages/AuthorDetailPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BooksPage } from './pages/BooksPage';
import { GoalsPage } from './pages/GoalsPage';
import { LoginPage } from './pages/LoginPage';
import { ReadingLogPage } from './pages/ReadingLogPage';
import { RequireAuth } from './RequireAuth';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from './auth/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header>
      <span className="site-title">dogear</span>
      {user && (
        <nav>
          <NavLink to="/">Reading Log</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/goals">Goals</NavLink>
        </nav>
      )}
      <ThemeToggle />
      {user && (
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      )}
    </header>
  );
}

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<ReadingLogPage />} />
            <Route path="/library" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/authors/:id" element={<AuthorDetailPage />} />
            <Route path="/goals" element={<GoalsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
