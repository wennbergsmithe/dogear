import { NavLink, Route, Routes } from 'react-router-dom';
import { BookDetailPage } from './pages/BookDetailPage';
import { BooksPage } from './pages/BooksPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReadingLogPage } from './pages/ReadingLogPage';

function App() {
  return (
    <div className="app">
      <nav>
        <NavLink to="/">Reading Log</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/goals">Goals</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<ReadingLogPage />} />
          <Route path="/library" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
