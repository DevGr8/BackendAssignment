import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';

export default function Vote() {
  const { id } = useParams();
  const nav = useNavigate();
  const [election, setElection] = useState(null);
  const [picked, setPicked] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api.get(`/elections/${id}`).then((r) => setElection(r.data)).catch((e) => setErr(errMsg(e))); }, [id]);

  const confirm = async () => {
    setErr('');
    try {
      const { data } = await api.post(`/elections/${id}/vote`, { candidateId: picked._id });
      setMsg(data.message);
      setTimeout(() => nav('/'), 1500);
    } catch (e) { setErr(errMsg(e)); setPicked(null); }
  };

  if (!election) return <p>{err || 'Loading…'}</p>;
  if (msg) return <div className="card"><h3>✅ {msg}</h3><p>Your vote is final and cannot be changed.</p></div>;

  // Vote confirmation screen
  if (picked) return (
    <div className="card">
      <h3>Confirm your vote</h3>
      <p>You are voting for <b>{picked.name}</b> as <b>{election.title}</b>.</p>
      <p className="err">This action is final — votes cannot be edited.</p>
      {err && <p className="err">{err}</p>}
      <div className="row"><button onClick={confirm}>Confirm vote</button><button className="ghost" onClick={() => setPicked(null)}>Go back</button></div>
    </div>
  );

  return (
    <>
      <h2>{election.title}</h2>
      {err && <p className="err">{err}</p>}
      {election.hasVoted && <p>You have already voted in this election.</p>}
      {election.candidates.map((c) => (
        <div className="card" key={c._id}>
          <h3>{c.name} <small>{c.department}</small></h3>
          <p>{c.manifesto}</p>
          {!election.hasVoted && election.status === 'open' && <button onClick={() => setPicked(c)}>Select</button>}
        </div>
      ))}
    </>
  );
}
