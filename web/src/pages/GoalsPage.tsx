import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Goal, GoalInterval } from '../api/types';

const INTERVAL_LABELS: Record<GoalInterval, string> = {
  year: 'per year',
  month: 'per month',
  week: 'per week',
};

const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function GoalProgressCell({ progress }: { progress: Goal['progress'] }) {
  if (progress.type === 'months') {
    return (
      <div className="goal-progress-months">
        {progress.met.map((met, i) => (
          <span
            key={i}
            className={`month-dot${met ? ' met' : ''}`}
            title={`${MONTH_INITIALS[i]}: ${met ? 'goal met' : 'goal missed'}`}
          />
        ))}
      </div>
    );
  }
  return <span>{progress.percent}%</span>;
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [target, setTarget] = useState(12);
  const [interval, setGoalInterval] = useState<GoalInterval>('year');

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
      await api.goals.set(year, target, interval);
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
        <select value={interval} onChange={(e) => setGoalInterval(e.target.value as GoalInterval)}>
          <option value="year">per year</option>
          <option value="month">per month</option>
          <option value="week">per week</option>
        </select>
        <button type="submit">Set goal</button>
      </form>

      <div className="table-wrap">
        <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Target</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {goals.length === 0 && (
            <tr className="empty">
              <td colSpan={3}>No goals set yet.</td>
            </tr>
          )}
          {goals.map((goal) => (
            <tr key={goal.id}>
              <td>{goal.year}</td>
              <td>
                {goal.target} {INTERVAL_LABELS[goal.interval]}
              </td>
              <td>
                <GoalProgressCell progress={goal.progress} />
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </section>
  );
}
