import cls from "../util/cls";

export default function Add({ className, onClick = () => {}, title }) {
  return (
    <svg 
      onClick={onClick}
      className={cls('icon--add', className)}
      fill="currentColor"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      title={title}
      alt={title}
    >
      <title>{title}</title>
      <rect width="2" height="16" x="7" y="0"/>
      <rect width="16" height="2" x="0" y="7"/>
    </svg>
  );
}