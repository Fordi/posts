import { useCallback, useEffect, useRef, useState } from 'react';
import Loading from '../Loading';
import useEventListener from '../util/useEventListener';
import './index.css';

const AccentBar = () => {
  const ref = useRef(null);
  const mouseEnter = useCallback((event) => {
    ref.current.classList.add('accent-bar--hover');
  }, [ref]);
  useEventListener(window, 'mouseover', useCallback((event) => {
    if (event.toElement?.closest('.accent-bar') !== ref.current) {
      ref.current.classList.remove('accent-bar--hover');
    }
  }, [ref]));
  const [pkg, setPkg] = useState(null);
  useEffect(() => {
    (async () => {
      setPkg(await window.API.getPackage());
    })();
  }, []);
  return (
    <div ref={ref} className="accent-bar" onMouseEnter={mouseEnter}>
      <div className="accent-bar__draggable"></div>
      <div className="accent-bar__info">
        <span className="accent-bar__title">{pkg?.properName ?? pkg?.name}</span>
        <span className="accent-bar__version">v{pkg?.version}</span>
        <span className="accent-bar__move">Drag to move note around</span>
      </div>
    </div>
  );
};

export default function Layout({ loading, style, className, children }) {
  const [displayLoading, setDisplayLoading] = useState(loading);
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setDisplayLoading(false);
      }, 1000);
    } else {
      setDisplayLoading(true);
    }
  }, [loading]);
  return (
    <div style={style} className={['layout', className].filter(a => !!a).join(' ')}>
      <AccentBar />
      <div className="layout__content">
        {children}
      </div>
      {displayLoading && <Loading loaded={!loading} />}
    </div>
  );
}