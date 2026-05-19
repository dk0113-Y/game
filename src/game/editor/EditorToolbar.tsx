import type { Terrain } from "../core/types";
import {
  BRUSH_MODE_LABELS,
  FEATURE_LABELS,
  ROAD_LEVEL_LABELS,
  TERRAIN_LABELS,
} from "../data/labels";
import type { FeatureType, RoadLevel } from "../data/maps/mapTypes";
import type { BrushMode } from "./editorTypes";
import {
  EDITOR_TERRAINS,
  FEATURE_TYPES,
  ROAD_LEVELS,
} from "./mapSerialization";

interface EditorToolbarProps {
  brushMode: BrushMode;
  terrainBrush: Terrain;
  featureBrush: FeatureType;
  roadBrush: RoadLevel;
  onBrushModeChange: (mode: BrushMode) => void;
  onTerrainBrushChange: (terrain: Terrain) => void;
  onFeatureBrushChange: (feature: FeatureType) => void;
  onRoadBrushChange: (roadLevel: RoadLevel) => void;
}

export function EditorToolbar({
  brushMode,
  terrainBrush,
  featureBrush,
  roadBrush,
  onBrushModeChange,
  onTerrainBrushChange,
  onFeatureBrushChange,
  onRoadBrushChange,
}: EditorToolbarProps) {
  return (
    <section className="editor-toolbar" aria-label="地图绘制工具栏">
      <div className="editor-tool-group">
        <span className="editor-tool-label">画笔</span>
        {(["terrain", "feature", "road", "startingPosition"] as BrushMode[])
          .map((mode) => (
            <button
              className={
                brushMode === mode ? "editor-button active" : "editor-button"
              }
              key={mode}
              onClick={() => onBrushModeChange(mode)}
              type="button"
            >
              {BRUSH_MODE_LABELS[mode]}
            </button>
          ))}
      </div>

      <div className="editor-tool-group">
        <span className="editor-tool-label">地形</span>
        {EDITOR_TERRAINS.map((terrain) => (
          <button
            className={
              terrainBrush === terrain && brushMode === "terrain"
                ? "editor-button active"
                : "editor-button"
            }
            key={terrain}
            onClick={() => {
              onBrushModeChange("terrain");
              onTerrainBrushChange(terrain);
            }}
            type="button"
          >
            {TERRAIN_LABELS[terrain]}
          </button>
        ))}
      </div>

      <div className="editor-tool-group">
        <span className="editor-tool-label">特征</span>
        {FEATURE_TYPES.map((feature) => (
          <button
            className={
              featureBrush === feature && brushMode === "feature"
                ? "editor-button active"
                : "editor-button"
            }
            key={feature}
            onClick={() => {
              onBrushModeChange("feature");
              onFeatureBrushChange(feature);
            }}
            type="button"
          >
            {FEATURE_LABELS[feature]}
          </button>
        ))}
      </div>

      <div className="editor-tool-group">
        <span className="editor-tool-label">道路</span>
        {ROAD_LEVELS.map((roadLevel) => (
          <button
            className={
              roadBrush === roadLevel && brushMode === "road"
                ? "editor-button active"
                : "editor-button"
            }
            key={roadLevel}
            onClick={() => {
              onBrushModeChange("road");
              onRoadBrushChange(roadLevel);
            }}
            type="button"
          >
            {ROAD_LEVEL_LABELS[roadLevel]}
          </button>
        ))}
      </div>
    </section>
  );
}
