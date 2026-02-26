import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ChatAssistant from "./ChatAssistant";

export default function GlobalChatWidget() {
  const { requireAuth } = useAuth();
  const [open, setOpen] = useState(false);

  function handleToggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    if (!requireAuth()) return;
    setOpen(true);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={handleToggleOpen}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-blue-600 text-white w-14 h-14 rounded-full shadow-xl hover:from-orange-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-2xl"
          aria-label="Open AI chat"
          title="Open AI assistant"
        >
          <span aria-hidden="true">🤖</span>
        </button>
      )}
      <ChatAssistant isOpen={open} onClose={() => setOpen(false)} mode="floating" />
    </>
  );
}

