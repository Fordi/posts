import busy from '../icons/busy.svg';
import cls from '../util/cls';
import "./index.css";

export default function Loading({ loaded = false }) {
  return (
    <div className={cls('loading', loaded && 'loaded')}>
      <img src={busy} width="100" alt="Loading" />
    </div>
  );
};
