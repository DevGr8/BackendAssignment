import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api.js';

export default function Elections() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { api.get('/elections').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))); }, []);

  return (
    <>
      <h2>Elections</h2>
      {err && <p className="err">{err}</p>}
      {list.length === 0 && !err && <p>No elections yet.</p>}
      {list.map((e) => (
        <div className="card" key={e._id}>
          <h3>{e.title} <span className={`tag ${e.status}`}>{e.status}</span></h3>
          <small>{new Date(e.startTime).toLocaleString()} → {new Date(e.endTime).toLocaleString()}</small>
          <div className="row">
            {user.role === 'student' && (
              e.hasVoted ? <span>✅ You have voted</span>
              : e.status === 'open' ? <Link to={`/elections/${e._id}/vote`}><button>Vote now</button></Link>
              : <span>Voting {e.status === 'upcoming' ? 'not started' : 'closed'}</span>
            )}
            {user.role === 'admin' && <Link to={`/elections/${e._id}/results`}><button>Live results</button></Link>}
          </div>
        </div>
      ))}
    </>
  );
}
