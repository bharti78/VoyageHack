import { useAuth } from "../context/AuthContext";

const personaOptions = [
  {
    type: "solo",
    title: "Solo Trip",
    description: "Personalized & Safety Focused",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
    color: "#3b82f6",
  },
  {
    type: "family",
    title: "Family Trip",
    description: "Comfort & Spacious Options",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: "from-pink-500 to-rose-500",
    color: "#ec4899",
  },
  {
    type: "couple",
    title: "Couple Trip",
    description: "Romantic & Intimate Experiences",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
    color: "#a855f7",
  },
  {
    type: "friends",
    title: "Friends Trip",
    description: "Fun & Adventure Activities",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: "from-green-500 to-teal-500",
    color: "#22c55e",
  },
];

export default function PersonaModal() {
  const { setShowPersona, selectPersona, user } = useAuth();

  return (
    <div
      className="fixed inset-0 z-[9100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl"
        style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.3,0.64,1) both" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#ff6600,#ff3366)" }}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            What type of trip are you planning? We'll personalize your experience.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {personaOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => selectPersona(option.type)}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white"
              style={{ "--hover-color": option.color }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${option.gradient} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                {option.icon}
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 text-sm">{option.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            You can change your travel type anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
