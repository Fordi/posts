import busy from '../icons/busy.svg';
import "./index.css";

export default function Loading({ loaded = false }) {
  return (
    <div className={['loading', loaded && 'loaded'].filter(a => !!a).join(' ')}>
      <img src={busy} width="100" alt="Loading" />
    </div>
  );
};
