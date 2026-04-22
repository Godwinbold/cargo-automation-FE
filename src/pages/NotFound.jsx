import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04080F] flex items-center justify-center">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #3b82f6 0%, #1d4ed8 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full transition-all duration-500 opacity-30"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            background: i % 2 === 0 ? "#3b82f6" : "#60a5fa",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${4 + (i % 4)}s  ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* Main card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 py-12 max-w-2xl w-full mx-4"
        style={{
          transform: `perspective(800px) rotateX(${mousePos.y * 0.05}deg) rotateY(${mousePos.x * 0.05}deg)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Plane icon */}
        <div className="mb-8 relative">
          <div
            className="absolute inset-0 rounded-full opacity-30 blur-2xl"
            style={{ background: "#3b82f6" }}
          />
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center border border-blue-500/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.1))",
              backdropFilter: "blur(12px)",
              animation: "spin-slow 8s linear infinite",
            }}
          >
            {/* Cargo plane SVG */}
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 16L3 10.5V13.5L8 15V18L11 19V16.5L21 16Z"
                fill="#3b82f6"
                opacity="0.9"
              />
              <path
                d="M21 16C21 16 13 14 8 15L5 8L3 8.5L6 15L3 14V17L21 16Z"
                fill="#60a5fa"
                opacity="0.8"
              />
              <path d="M8 15L9 19H11L11 15" fill="#93c5fd" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* 404 number */}
        <div className="relative mb-2">
          <span
            className="font-black text-[120px] leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #3b82f6 60%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 40px rgba(59,130,246,0.5))",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            404
          </span>
          {/* Reflection */}
          <span
            className="absolute top-full left-0 right-0 font-black text-[120px] leading-none select-none opacity-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #3b82f6 60%, #1d4ed8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              transform: "scaleY(-1)",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            404
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 w-full max-w-xs">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <span className="text-blue-400/60 text-xs font-medium tracking-widest uppercase">
            Lost in Transit
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-semibold mb-3 tracking-tight">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-blue-200/50 text-sm leading-relaxed mb-10 max-w-sm">
          The page you're looking for seems to have gone off-route. It may have
          been moved, deleted, or the URL might be incorrect.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl text-sm font-medium text-blue-300 border border-blue-500/30 transition-all duration-200 hover:border-blue-400/60 hover:text-blue-200 hover:bg-blue-500/5 active:scale-95"
            style={{ backdropFilter: "blur(8px)" }}
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}
          >
            Go Home
          </button>
        </div>

        {/* Countdown */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-blue-200/30 text-xs">
            Redirecting to home in{" "}
            <span className="text-blue-400 font-semibold">{countdown}s</span>
          </p>
          {/* Progress bar */}
          <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(countdown / 10) * 100}%`,
                background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom grid lines */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(59,130,246,0.05) 0%, transparent 100%)",
        }}
      />

      {/* Keyframe styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
