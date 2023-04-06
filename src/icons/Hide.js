import cls from "../util/cls";

export default function Trash({ className, onClick = () => {}, title }) {
  return (
    <svg 
      onClick={onClick}
      className={cls('icon--hide', className)}
      fill="currentColor"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      title={title}
      alt={title}
    >
      <title>{title}</title>
      <path d="m0 19 5-5 27 27 27-27 5 5-32 32Z"/>
    </svg>
  );
}
