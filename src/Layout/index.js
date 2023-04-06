import { useCallback, useEffect, useState } from 'react';
import Loading from '../Loading';
import cls from '../util/cls';
import useHovered from '../util/useHovered';
import usePackage from '../util/usePackage';
import './index.css';
import Menu from './Menu';

const AccentBar = ({ menu }) => {
  const pkg = usePackage();
  // anything that can drag the window doesn't get mouse events,
  // so not only do we have to keep programmatic track of hover state,
  // we have to listen on over events to all the _other_ elements.
  const [over, ref] = useHovered();
  const [dragging, setDragging] = useState(false);
  const startDrag = useCallback(() => {
    setDragging(true);
  }, []);
  useEffect(() => {
    if (!over) setDragging(false);
  }, [over]);
  return (
    <div 
      ref={ref}
      onMouseDown={startDrag}
      className={cls('accent-bar', over && 'accent-bar--hover', dragging && 'accent-bar--dragging')}
    >
      <div className="accent-bar__draggable"></div>
      <div className="accent-bar__info">
        <div className="accent-bar__drag">
          <span className="accent-bar__title">{pkg?.properName ?? pkg?.name}</span>
          <span className="accent-bar__version">v{pkg?.version}</span>
        </div>
        <Menu items={menu} />
      </div>
    </div>
  );
};

export default function Layout({ loading, style, className, children, menu, accels }) {
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
    <div style={style} className={cls('layout', className)}>
      <AccentBar menu={menu} accels={accels} />
      <div className="layout__content">
        {children}
      </div>
      {displayLoading && <Loading loaded={!loading} />}
    </div>
  );
}