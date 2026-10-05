import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';

const blank = { name: '', department: '', manifesto: '' };

// Admin: create an election (with optional first candidates)
export function CreateElection() {
  const nav = useNavigate();
  const [f, setF] = useState({ title: '', description: '', startTime: '', endTime: '' });
  const [cands, setCands] = useState([{ ...blank }, { ...blank }]);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setC = (i, k) => (e) => setCands(cands.map((c, j) => (j === i ? { ...c, [k]: e.target.value } : c)));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/elections', {
        ...f,
        startTime: new Date(f.startTime).toISOString(), // local time -> UTC
        endTime: new Date(f.endTime).toISOString(),
        candidates: cands.filter((c) => c.name.trim()),
      });
      nav('/');
    } catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create election</h2>
      <input placeholder="Title (e.g. President)" value={f.title} onChange={set('title')} required />
      <input placeholder="Description (optional)" value={f.description} onChange={set('description')} />
      <label>Voting starts <input type="datetime-local" value={f.startTime} onChange={set('startTime')} required /></label>
      <label>Voting ends <input type="datetime-local" value={f.endTime} onChange={set('endTime')} required /></label>
      <h3>Candidates</h3>
      {cands.map((c, i) => (
        <div className="card" key={i}>
          <input placeholder="Name" value={c.name} onChange={setC(i, 'name')} />
          <input placeholder="Department" value={c.department} onChange={setC(i, 'department')} />
          <input placeholder="Manifesto" value={c.manifesto} onChange={setC(i, 'manifesto')} />
        </div>
      ))}
      <button type="button" className="ghost" onClick={() => setCands([...cands, { ...blank }])}>+ Add another candidate</button>
      {err && <p className="err">{err}</p>}
      <button>Create election</button>
    </form>
  );
}

// Admin: add one candidate to an upcoming election
export function AddCandidate() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState({ ...blank });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setC({ ...c, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try { await api.post(`/elections/${id}/candidates`, c); nav('/'); }
    catch (e2) { setErr(errMsg(e2)); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Add candidate</h2>
      <input placeholder="Name" value={c.name} onChange={set('name')} required />
      <input placeholder="Department" value={c.department} onChange={set('department')} />
      <input placeholder="Manifesto" value={c.manifesto} onChange={set('manifesto')} />
      {err && <p className="err">{err}</p>}
      <div className="row"><button>Add</button><button type="button" className="ghost" onClick={() => nav('/')}>Cancel</button></div>
    </form>
  );
}