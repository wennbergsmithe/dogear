import { NavLink, Route, Routes } from 'react-router-dom';
import { AuthorDetailPage } from './pages/AuthorDetailPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BooksPage } from './pages/BooksPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReadingLogPage } from './pages/ReadingLogPage';
import { ThemeToggle } from './ThemeToggle';

function App() {
  return (
    <div className="app">
      <header>
        <span className="site-title">dogear</span>
        <nav>
          <NavLink to="/">Reading Log</NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/goals">Goals</NavLink>
        </nav>
        <ThemeToggle />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ReadingLogPage />} />
          <Route path="/library" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/authors/:id" element={<AuthorDetailPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
