import { useEffect, useState } from "react";

export default function DriftScene() {
  const [visible, setVisible] = useState(
    () => document.visibilityState === "visible",
  );

  useEffect(() => {
    const updateVisibility = () =>
      setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return (
    <div
      className={`drift-scene ${visible ? "" : "is-inactive"}`}
      role="img"
      aria-label="Minh họa xe PaceCar ôm cua trên cung đường"
    >
      <div className="drift-scene__road" aria-hidden="true" />
      <svg
        className="relative z-10 mx-auto block h-auto w-full max-w-[580px] overflow-visible"
        viewBox="0 0 640 420"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="carBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#7AA7FF" />
            <stop offset="0.55" stopColor="#386CF5" />
            <stop offset="1" stopColor="#20379B" />
          </linearGradient>
          <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#DCE8FF" />
            <stop offset="1" stopColor="#8FB5FF" />
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#5C8CFF" stopOpacity=".4" />
            <stop offset="1" stopColor="#5C8CFF" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <ellipse cx="330" cy="322" rx="235" ry="75" fill="url(#glow)" />
        <path
          className="drift-scene__streak"
          d="M65 275c75-36 117-39 183-26M36 307c61-22 111-25 159-17M95 340c47-11 79-13 112-9"
          fill="none"
          stroke="#91B3FF"
          strokeLinecap="round"
          strokeWidth="5"
          opacity=".6"
        />
        <g className="drift-scene__smoke" fill="#DCE8FF">
          <circle cx="154" cy="244" r="28" opacity=".52" />
          <circle cx="121" cy="224" r="21" opacity=".3" />
          <circle cx="184" cy="211" r="17" opacity=".34" />
          <circle cx="202" cy="246" r="25" opacity=".23" />
        </g>
        <g className="drift-scene__car">
          <ellipse
            cx="360"
            cy="330"
            rx="206"
            ry="34"
            fill="#08112C"
            opacity=".55"
            filter="url(#softGlow)"
          />
          <path
            d="m176 282 29-50c18-31 40-48 80-56l96-17c35-6 62 5 86 28l43 42 49 18c15 6 23 16 26 33l5 32c2 12-6 20-19 21l-29 3c-7-35-29-56-59-54-30 1-48 26-48 61l-154 4c-4-34-25-53-53-52-30 1-46 23-46 58l-25 1c-17 1-27-9-25-26l4-28c2-9 7-15 20-17Z"
            fill="url(#carBody)"
            stroke="#BDD2FF"
            strokeOpacity=".7"
            strokeWidth="3"
          />
          <path
            d="m243 231 18-29c10-16 24-25 48-29l67-12-8 70H236l7 0Zm145-72 20-4c19-3 35 3 49 16l39 39-99 0-9-51Z"
            fill="url(#glass)"
            stroke="#EAF1FF"
            strokeOpacity=".65"
            strokeWidth="3"
          />
          <path d="m382 161 12 77h-25l8-75Z" fill="#20379B" opacity=".7" />
          <path
            d="m214 275 31 2m265-6 31 7"
            stroke="#F7B938"
            strokeLinecap="round"
            strokeWidth="9"
          />
          <path
            d="m478 294 20-2m-279 6 19-1"
            stroke="#F8FAFC"
            strokeLinecap="round"
            strokeWidth="5"
            opacity=".9"
          />
          <g>
            <circle cx="256" cy="339" r="42" fill="#111827" />
            <circle cx="256" cy="339" r="25" fill="#CBD5E1" />
            <circle cx="256" cy="339" r="12" fill="#64748B" />
            <path
              d="m256 316 0 46m-23-23h46m-39-16 32 32m0-32-32 32"
              stroke="#F8FAFC"
              strokeOpacity=".72"
              strokeWidth="4"
            />
            <circle cx="473" cy="334" r="42" fill="#111827" />
            <circle cx="473" cy="334" r="25" fill="#CBD5E1" />
            <circle cx="473" cy="334" r="12" fill="#64748B" />
            <path
              d="m473 311 0 46m-23-23h46m-39-16 32 32m0-32-32 32"
              stroke="#F8FAFC"
              strokeOpacity=".72"
              strokeWidth="4"
            />
          </g>
          <path
            d="m191 265-9 18m367-39 15 11"
            stroke="#F8FAFC"
            strokeLinecap="round"
            strokeWidth="4"
            opacity=".75"
          />
        </g>
        <g fill="#F7B938">
          <path d="m500 96 5 13 13 5-13 5-5 13-5-13-13-5 13-5 5-13Z" />
          <circle cx="148" cy="119" r="5" />
          <circle cx="536" cy="178" r="4" />
        </g>
      </svg>
      <div className="absolute right-0 top-8 hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm shadow-lg backdrop-blur sm:block">
        <span className="flex items-center gap-2 font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Hành trình an tâm
        </span>
        <span className="mt-1 block text-xs text-blue-100">
          Minh bạch từ lúc nhận xe
        </span>
      </div>
    </div>
  );
}
