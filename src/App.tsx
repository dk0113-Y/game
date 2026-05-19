import { useState } from "react";
import "./App.css";
import { MapEditorView } from "./game/editor/MapEditorView";
import { GameView } from "./game/ui/GameView";

type AppMode = "play" | "editor";

function App() {
  const [mode, setMode] = useState<AppMode>("play");

  return (
    <>
      <div className="mode-switcher" aria-label="应用模式">
        <button
          className={mode === "play" ? "mode-button active" : "mode-button"}
          onClick={() => setMode("play")}
          type="button"
        >
          游玩模式
        </button>
        <button
          className={mode === "editor" ? "mode-button active" : "mode-button"}
          onClick={() => setMode("editor")}
          type="button"
        >
          编辑模式
        </button>
      </div>
      {mode === "play" ? <GameView /> : <MapEditorView />}
    </>
  );
}

export default App;
