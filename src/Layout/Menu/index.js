import { normalizeShortcut } from "../../util/keys";
import useAccelerators from "../../util/useAccelerators";
import "./index.css";

const combineTitle = (title, accel) => {
  if (!accel || !accel.length) return title;
  return `${title} (${normalizeShortcut(accel[0])})`;
};

export default function Menu({ items = [] }) {
  useAccelerators(
    () => items.reduce(
      (o, { accel, onClick }) => 
        accel
          ? {...o, [accel.join(', ')]: onClick }
          : o,
      {}
    ),
    [items]
  );

  if (!items.length) return null;

  return (
    <div className="menu" id="menu">
      {items.map(({ icon, key, title, comp: Comp, props, onClick = () => {}, accel }) => {
        return Comp ? (
          <Comp
            key={key || title}
            className="menu__item"
            title={combineTitle(title, accel)}
            onClick={onClick}
            {...props}
          />
        ) : (
          <input
            className="menu__item"
            alt={title}
            title={title}
            type="image"
            key={key || title}
            src={icon}
            onClick={onClick}
          />
        );
      })}
    </div>
  );
}