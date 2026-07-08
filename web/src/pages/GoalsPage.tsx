import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Goal } from '../api/types';

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [target, setTarget] = useState(12);

  function load() {
    api.goals
      .list()
      .then(setGoals)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleSet(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.goals.set(year, target);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section>
      <h2>Goals</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSet}>
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Target"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          required
        />
        <button type="submit">Set goal</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id}>
              <td>{goal.year}</td>
              <td>{goal.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
