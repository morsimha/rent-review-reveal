
import { useThemeDetails } from "@/contexts/ThemeContext";
import { House } from "lucide-react";

const ThemeHeader = () => {
  const { theme, cycleTheme } = useThemeDetails();
  // נבחר אימוג'י ראשי מנושא
  const mainEmoji = theme.emojis[0];

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center items-center gap-2 mb-2">
        {/* אימוג'י שהוא "כפתור סודי" */}
        <button
          className="p-2 rounded-full hover:scale-125 transition transform bg-white/40 text-3xl border-2 border-purple-200 shadow"
          style={{ lineHeight: "1", fontSize: "2.4rem", minWidth: "3rem" }}
          aria-label="שנה ערכת נושא"
          onClick={e => { e.stopPropagation(); cycleTheme(); }}
        >
          <span role="img" aria-hidden="true">{mainEmoji}</span>
        </button>
        <h1 className={`text-4xl font-bold ${theme.className} transition-colors`}>
          מור וגבי מוצאים דירה
        </h1>
      </div>
      <p className="text-lg font-semibold mb-2 text-purple-700">{theme.name}</p>
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {/* אפשר לשלב עוד אייקונים ל"זיקוק" ערכת הנושא */}
        {theme.emojis.slice(1).map((emj, i) => (
          <span key={i} className="text-2xl" aria-hidden="true">{emj}</span>
        ))}
      </div>
    </div>
  );
};

export default ThemeHeader;
