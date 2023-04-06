import cls from "../util/cls";

export default function Trash({ className, onClick = () => {}, title }) {
  return (
    <svg 
      onClick={onClick}
      className={cls('icon--trash', className)}
      fill="currentColor"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      title={title}
      alt={title}
    >
      <title>{title}</title>
      <path d="M4 30V10c-1 0-2-1-2-2V6c0-1 1-2 2-2h6V2c0-1 1-2 2-2h8c1 0 2 1 2 2v2h6c1 0 2 1 2 2v2c0 1-1 2-2 2v20c0 1-1 2-2 2H6c-1 0-2-1-2-2zm22-20h-4v15c0 1-2 1-2 0V10h-3v15c0 1-2 1-2 0V10h-3v15c0 1-2 1-2 0V10H6v20h20V10Zm2-4H4v2h24Zm-8-4h-8v2h8z"/>
    </svg>
  );
}
