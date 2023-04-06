import cls from "../../util/cls";
import "./index.css";

export default function ColorPicker({ className, onChange, value, title }) {
  return <input className={cls('color-picker', className)} type="color" onChange={onChange} value={value} title={title} />
};
