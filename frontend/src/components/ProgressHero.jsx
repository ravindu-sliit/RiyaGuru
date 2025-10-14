import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function ProgressHero({ title, subtitle, icon, ctaText, ctaTo, children }) {
  const Icon = icon || <Calendar className="w-8 h-8 text-white" />;
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            {Icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-orange-100 mt-1">{subtitle}</p>}
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
