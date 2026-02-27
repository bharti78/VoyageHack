import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import ChatAssistant from "./ChatAssistant";

export default function GlobalChatWidget() {
  const { requireAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (open) {
      setShowHint(false);
      return;
    }
    let timer;
    try {
      const seen = sessionStorage.getItem("voyagehack.chatHintSeen") === "1";
      if (!seen) {
        setShowHint(true);
        timer = setTimeout(() => setShowHint(false), 7000);
      }
    } catch {
      setShowHint(true);
      timer = setTimeout(() => setShowHint(false), 7000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  function dismissHint() {
    try {
      sessionStorage.setItem("voyagehack.chatHintSeen", "1");
    } catch {
      void 0;
    }
    setShowHint(false);
  }

  function handleToggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    if (!requireAuth()) return;
    dismissHint();
    setOpen(true);
  }

  return (
    <>
      {!open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1300] flex flex-col items-end gap-2">
          {showHint && (
            <div className="max-w-[240px] rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
              <div className="flex items-start gap-2">
                <span aria-hidden="true">💬</span>
                <span>Need travel help? Tap this AI assistant icon.</span>
                <button
                  type="button"
                  onClick={dismissHint}
                  className="ml-1 text-slate-400 hover:text-slate-600"
                  aria-label="Close chat hint"
                >
                  x
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleToggleOpen}
            className="bg-gradient-to-r from-orange-500 to-blue-600 text-white w-14 h-14 rounded-full shadow-xl hover:from-orange-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-2xl"
            aria-label="Open AI chat"
            title="Open AI assistant"
          >
            <span aria-hidden="true">🤖</span>
          </button>
        </div>
      )}
      <ChatAssistant isOpen={open} onClose={() => setOpen(false)} mode="floating" />
    </>
  );
}
