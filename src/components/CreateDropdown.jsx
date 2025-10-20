// ============================================================
// 📦 CreateDropdown.jsx — menu suspenso (Postar / Ao vivo)
// ============================================================
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, Video } from "lucide-react";
import "../styles/sidebar.css"; // usa o mesmo css da sidebar

const CreateDropdown = ({ onSelect, anchorRect }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const docEl = document.documentElement;
    if (anchorRect) {
      // posiciona abaixo do trigger, com pequeno offset
      const top = anchorRect.bottom + window.scrollY + 6;
      const left = anchorRect.left + window.scrollX;
      setPos({ top, left });
    }
  }, [anchorRect]);

  useEffect(() => {
    if (!anchorRect) return;
    const update = () => {
      const top = anchorRect.bottom + window.scrollY + 6;
      const left = anchorRect.left + window.scrollX;
      setPos({ top, left });
    };
    window.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [anchorRect]);

  const dropdown = (
    <div
      className="create-dropdown"
      style={{ position: "absolute", top: pos.top + "px", left: pos.left + "px" }}
    >
      <button onClick={() => onSelect("post")}>
        <Camera size={18} />
        <span>Postar</span>
      </button>
      <button onClick={() => onSelect("live")}>
        <Video size={18} />
        <span>Ao vivo</span>
      </button>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(dropdown, document.body) : null;
};

export default CreateDropdown;
