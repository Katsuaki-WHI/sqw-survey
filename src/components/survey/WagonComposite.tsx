"use client";

import type { QuestionCategory } from "@/lib/survey/questions";
import { useLocale } from "@/lib/i18n/context";

interface CategoryScore {
  avg: number;
  level: string;
}

interface WagonCompositeProps {
  categoryScores: Partial<Record<QuestionCategory, CategoryScore>>;
  wagonSpeed: number;
  teamAverage: number;
}

const IMG_BASE = "https://survey.workhappiness.co.jp/img/ancate";

/**
 * Score to stage mapping (matches reference site):
 * 4.50+ → 5 (とても良い)
 * 4.00-4.49 → 4 (良い)
 * 3.50-3.99 → 3 (普通)
 * 2.50-3.49 → 2 (悪い)
 * 1.00-2.49 → 1 (とても悪い)
 */
function scoreToStage(avg: number): number {
  if (avg >= 4.5) return 5;
  if (avg >= 4.0) return 4;
  if (avg >= 3.5) return 3;
  if (avg >= 2.5) return 2;
  return 1;
}

/** Canvas dimensions match the reference site */
const CANVAS_W = 800;
const CANVAS_H = 420;

/**
 * Layer definitions: each layer has a URL builder and position within the 800x420 canvas.
 * Layers are rendered in array order (first = bottom, last = top).
 */
interface Layer {
  key: string;
  src: string;
  width: number;
  height: number;
  top: number;
  left: number;
  zIndex: number;
}

function buildLayers(scores: Partial<Record<QuestionCategory, CategoryScore>>): Layer[] {
  const stage = (cat: QuestionCategory) => scoreToStage(scores[cat]?.avg ?? 3);

  const bg = stage("landscape");
  const road = stage("road");
  const tire = stage("tire");
  const cargo = stage("cargo");
  const body = stage("body");
  const attitude = stage("attitude");
  const rope = stage("rope");
  const diversity = stage("diversity");
  const happiness = stage("happiness");

  const layers: Layer[] = [];

  // 1. Background (景色) - full canvas
  layers.push({
    key: "background",
    src: `${IMG_BASE}/result_background${bg}.png`,
    width: 800, height: 420, top: 0, left: 0, zIndex: 1,
  });

  // 2. Path (道筋) - bottom aligned
  layers.push({
    key: "path",
    src: `${IMG_BASE}/result_path${road}.png`,
    width: 800, height: 333, top: 87, left: 0, zIndex: 2,
  });

  // 3. Diversity background staff (behind wagon)
  // staff1 = sweeping person (behind), shown for diversity ≥ 2
  if (diversity >= 2) {
    layers.push({
      key: "staff1",
      src: `${IMG_BASE}/result_staff1.png`,
      width: 160, height: 196, top: 190, left: 118, zIndex: 3,
    });
  }
  // staff2 = telescope person, shown for diversity ≥ 3
  if (diversity >= 3) {
    layers.push({
      key: "staff2",
      src: `${IMG_BASE}/result_staff2.png`,
      width: 160, height: 196, top: 185, left: 45, zIndex: 3,
    });
  }

  // 4. Cargo on truck (積荷)
  layers.push({
    key: "cargo",
    src: `${IMG_BASE}/result_cargo${cargo}_truck.png`,
    width: 353, height: 236, top: 145, left: 265, zIndex: 5,
  });

  // 5. Tire/truck (タイヤ)
  layers.push({
    key: "tire",
    src: `${IMG_BASE}/result_tire_truck${tire}.png`,
    width: 353, height: 225, top: 160, left: 265, zIndex: 6,
  });

  // 6. Push person (押す人の体)
  layers.push({
    key: "push",
    src: `${IMG_BASE}/result_push${body}.png`,
    width: 203, height: 221, top: 168, left: 185, zIndex: 7,
  });

  // 7. Face expressions (押す人の態度) - two faces overlaid on push person
  layers.push({
    key: "face_a",
    src: `${IMG_BASE}/result_face_${attitude}_a.png`,
    width: 101, height: 76, top: 170, left: 228, zIndex: 8,
  });
  layers.push({
    key: "face_b",
    src: `${IMG_BASE}/result_face_${attitude}_b.png`,
    width: 95, height: 72, top: 178, left: 290, zIndex: 8,
  });

  // 8. Pull person with rope (ロープ)
  layers.push({
    key: "pull",
    src: `${IMG_BASE}/result_pull${rope}.png`,
    width: 162, height: 190, top: 185, left: 580, zIndex: 9,
  });

  // 9. Diversity foreground staff (in front of wagon)
  // staff3 = two people sitting, shown for diversity ≥ 4
  if (diversity >= 4) {
    layers.push({
      key: "staff3",
      src: `${IMG_BASE}/result_staff3.png`,
      width: 160, height: 196, top: 215, left: 430, zIndex: 10,
    });
  }

  // 10. Happiness (幸福度)
  layers.push({
    key: "happiness",
    src: `${IMG_BASE}/result_happiness${happiness}.png`,
    width: 190, height: 142, top: 60, left: 305, zIndex: 11,
  });

  // 11. Copyright
  layers.push({
    key: "copyright",
    src: `${IMG_BASE}/result_copyright.png`,
    width: 464, height: 24, top: 394, left: 168, zIndex: 12,
  });

  return layers;
}

export default function WagonComposite({
  categoryScores,
  wagonSpeed,
  teamAverage,
}: WagonCompositeProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const layers = buildLayers(categoryScores);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Wagon Speed */}
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">
          {isEn ? "Wagon Push Force" : "ワゴン推進力"}
        </p>
        <p className="text-5xl font-bold text-blue-600">
          {wagonSpeed} <span className="text-2xl">km</span>
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isEn ? "Team Average" : "平均スコア"}: {teamAverage.toFixed(2)} / 5.00
        </p>
      </div>

      {/* Composite wagon illustration */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      >
        {layers.map((layer) => (
          <img
            key={layer.key}
            src={layer.src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              top: `${(layer.top / CANVAS_H) * 100}%`,
              left: `${(layer.left / CANVAS_W) * 100}%`,
              width: `${(layer.width / CANVAS_W) * 100}%`,
              height: `${(layer.height / CANVAS_H) * 100}%`,
              objectFit: "contain",
              zIndex: layer.zIndex,
            }}
          />
        ))}
      </div>
    </div>
  );
}
