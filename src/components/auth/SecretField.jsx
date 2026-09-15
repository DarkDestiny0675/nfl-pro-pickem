import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import "./SecretField.css";

export default function SecretField({ label, value, onChange, placeholder, minLength }) {
  const [visible, setVisible] = useState(false);
  return (
    <label>{label}<span className="secret-input-wrap"><input required type={visible ? "text" : "password"} minLength={minLength} placeholder={placeholder} value={value} onChange={onChange} /><button type="button" className="secret-toggle" onClick={() => setVisible((shown) => !shown)} aria-label={visible ? `Hide ${label}` : `Show ${label}`}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
  );
}
