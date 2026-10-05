import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = () => api.get(`/elections/${id}/results`).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
    load();
    const t = setInterval(load, 5000); // live refresh
    return () => clearInterval(t);
  }, [id]);

  if (!data) return <p>{err || 'Loading…'}</p>;
  return (
    <>
      <h2>{data.election.title} — Live Results <span className={`tag ${data.election.status}`}>{data.election.status}</span></h2>
      <p>Total votes: <b>{data.totalVotes}</b></p>
      {data.results.map((r) => (
        <div className="card" key={r.candidateId}>
          <div className="row spread"><b>{r.name}</b><span>{r.votes} votes ({r.percentage}%)</span></div>
          <div className="meter"><div style={{ width: `${r.percentage}%` }} /></div>
        </div>
      ))}
    </>
  );
}
