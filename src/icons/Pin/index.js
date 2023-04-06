
import cls from "../../util/cls";
import "./index.css";

export default function Pin({ pinned, className, onClick = () => {}, title }) {
  return (
    <svg
      onClick={onClick}
      className={cls(
        "icon--pin", 
        pinned && "icon--pin--in",
        className
      )}
      fill="currentColor"
      viewBox="0 0 16 16"
      version="1.2"
      xmlns="http://www.w3.org/2000/svg"
      title={title}
      alt={title}
    >
      <title>{title}</title>
      <path d="M12 1c-.5-.5-1-1-1 1-2 4-7 5-8 4S2 7 3 8l2 2-5 6 6-5 2 2c1 1 3 1 2 0s0-6 4-8c2 0 1.5-.5 1-1l-3-3Z" />
    </svg>
  );
}