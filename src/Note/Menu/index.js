import "./index.css";

export default function Menu({ note, items = [] }) {
  if (!note) return null;
  return (
    <div className="menu" id="menu">
      {items.map(({ icon, title, comp: Comp, props, onClick }) => {
        if (Comp) {
          return <Comp key={title} {...props} title={title} />
        }
        return <input className="menu_icon" alt={title} title={title} type="image" key={title} src={icon} onClick={onClick} />;
      })}
    </div>
  );
}