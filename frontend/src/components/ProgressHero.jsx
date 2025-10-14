import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function ProgressHero({ title, subtitle, icon, ctaText, ctaTo, children, padY, iconContainerClass, transparent, tint }) {
  const Icon = icon || <Calendar className="w-8 h-8 text-white" />;
  const innerPadY = padY || "py-8";
  const iconWrap = iconContainerClass || "w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center";
  const chosenTint = tint || "dark"; // 'dark' | 'light'
  const baseClass = transparent ? (chosenTint === "dark" ? "bg-black/40" : "bg-white") : "";
  const baseStyle = transparent
    ? { border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }
    : {
        backgroundImage:
          "linear-gradient(90deg, rgba(10,26,47,0.55) 0%, rgba(10,26,47,0.45) 100%)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.28)",
      };
  return (
    <div className={`shadow-lg rounded-2xl overflow-hidden ${baseClass}`} style={baseStyle}>
      <div className={`max-w-7xl mx-auto px-6 ${innerPadY} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={iconWrap}>
            {Icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-200 mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {children}
          {ctaTo && (
            <Link
              to={ctaTo}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200"
            >
              {ctaText || "Action"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
