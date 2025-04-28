import { useState, useEffect } from "react";
import "./Toolbar.css";

interface ToolbarProps {
  onToggleVariablesPanel: () => void;
  onTogglePlayer: () => void;
  onToggleGraphManager: () => void;
}

const Toolbar = ({
  onToggleVariablesPanel,
  onTogglePlayer,
  onToggleGraphManager,
}: ToolbarProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    // Check local storage or system preference for initial theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    // Default to light theme if nothing is saved or preferred
    return "light";
  });

  // Effect to apply the theme class to the body and save preference
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <header className="toolbar">
      <div className="toolbar-content">
        <h1>Visual Novel Authoring Tool</h1>
        <button onClick={toggleTheme} className="toolbar-button">
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </button>
        <button onClick={onToggleVariablesPanel} className="toolbar-button">
          Manage Variables
        </button>
        <button onClick={onToggleGraphManager} className="toolbar-button">
          {" "}
          Manage Graphs
        </button>
        <button onClick={onTogglePlayer} className="toolbar-button">
          {" "}
          Test Player
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
