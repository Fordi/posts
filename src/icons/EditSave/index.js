
import cls from "../../util/cls";
import "./index.css";

export default function EditSave({ editing, className, onClick = () => {}, title }) {
  return (
    <svg
      onClick={onClick}
      className={cls(
        editing ? "icon--edit" : "icon--save",
        className
      )}
      fill="currentColor"
      viewBox="0 0 32 32"
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      title={title}
      alt={title}
    >
      <title>{title}</title>
      <path className="icon--save__save" d="M0 0h16v2H2v28h28V16h2v16H0Zm24 4 2-2 4 4-2 2zM12 16 22 6l4 4-10 10ZM6 26l4-8 4 4z"/>
      <path className="icon--edit__edit" d="M0 30V2l2-2h2v8h14V0h6l8 8v22c0 1-1 2-2 2H2c-1 0-2-1-2-2Zm28-18H4v16h24ZM9 22c1 1 13-1 14 0 1 0 1 4 0 4-1-1-13 1-14 0-1 0-1-4 0-4zm0-8c1 1 13-1 14 0 1 0 1 4 0 4-1-1-13 1-14 0-1 0-1-4 0-4Zm1-14h6v6h-6z"/>
    </svg>
  );
}