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
 * Score → stage:
 *  4.50〜5.00 → 5（大変良い）
 *  3.75〜4.49 → 4（良い）
 *  3.00〜3.74 → 3（普通）
 *  2.00〜2.99 → 2（悪い）
 *  1.00〜1.99 → 1（とても悪い）
 */
function scoreToStage(avg: number): number {
  if (avg >= 4.5) return 5;
  if (avg >= 3.75) return 4;
  if (avg >= 3.0) return 3;
  if (avg >= 2.0) return 2;
  return 1;
}

/**
 * Container: 700x420px (from reference CSS: #ancate_detail .resultImage)
 * All images: position: absolute, positioned with bottom/left/width
 *
 * Positions extracted from https://survey.workhappiness.co.jp/css/style.css
 */
const CONTAINER_W = 700;
const CONTAINER_H = 420;

interface Layer {
  key: string;
  src: string;
  bottom: number;
  left: number;
  width: number;
}

function buildLayers(scores: Partial<Record<QuestionCategory, CategoryScore>>): Layer[] {
  const s = (cat: QuestionCategory) => scoreToStage(scores[cat]?.avg ?? 3);

  const bg = s("landscape");
  const road = s("road");
  const tire = s("tire");
  const cargo = s("cargo");
  const body = s("body");
  const attitude = s("attitude");
  const rope = s("rope");
  const diversity = s("diversity");
  const happiness = s("happiness");

  const layers: Layer[] = [];

  // 1. Background (景色) - full width, anchored at top-left
  //    CSS: width: 700px (no bottom/left specified → defaults to top:0 left:0)
  layers.push({
    key: "background",
    src: `${IMG_BASE}/result_background${bg}.png`,
    bottom: 0, left: 0, width: 700,
  });

  // 2. Path (道筋)
  //    CSS: bottom: 39px; width: 660px; (no left → 0)
  layers.push({
    key: "path",
    src: `${IMG_BASE}/result_path${road}.png`,
    bottom: 39, left: 0, width: 660,
  });

  // 3. Diversity staff (behind wagon, HTML order: staff1 → staff2 → staff4)
  //    stage1: 全員非表示
  //    stage2: staff1のみ
  //    stage3: staff1+2
  //    stage4: staff1+2+3 (staff3 is foreground, added after pull)
  //    stage5: staff1+2+3+4

  // staff1 (right side)
  //    CSS: bottom: 211px; left: 508px; width: 110px
  if (diversity >= 2) {
    layers.push({
      key: "staff1",
      src: `${IMG_BASE}/result_staff1.png`,
      bottom: 211, left: 508, width: 110,
    });
  }

  // staff2 (far right)
  //    CSS: bottom: 160px; left: 594px; width: 100px
  if (diversity >= 3) {
    layers.push({
      key: "staff2",
      src: `${IMG_BASE}/result_staff2.png`,
      bottom: 160, left: 594, width: 100,
    });
  }

  // staff4 (leftmost, behind pusher)
  //    CSS: bottom: 216px; left: 45px; width: 100px
  if (diversity >= 5) {
    layers.push({
      key: "staff4",
      src: `${IMG_BASE}/result_staff4.png`,
      bottom: 216, left: 45, width: 100,
    });
  }

  // 4. Cargo (積荷) - the goods on top of truck
  //    CSS: bottom: 219px; left: 215px; width: 262px
  layers.push({
    key: "cargo",
    src: `${IMG_BASE}/result_cargo${cargo}.png`,
    bottom: 219, left: 215, width: 262,
  });

  // 5. Truck with tires (タイヤ)
  //    CSS: bottom: 85px; left: 170px; width: 323px
  layers.push({
    key: "truck",
    src: `${IMG_BASE}/result_tire_truck${tire}.png`,
    bottom: 85, left: 170, width: 323,
  });

  // 6. Push person (押す人の体)
  //    CSS: bottom: 100px; left: 84px; width: 137px
  layers.push({
    key: "push",
    src: `${IMG_BASE}/result_push${body}.png`,
    bottom: 100, left: 84, width: 137,
  });

  // 7. Face expressions (押す人の態度)
  //    Face positions vary by stage
  const facePositions: Record<number, { a: { bottom: number; left: number; width: number }; b: { bottom: number; left: number; width: number } }> = {
    1: { a: { bottom: 195, left: 107, width: 77 }, b: { bottom: 180, left: 122, width: 75 } },
    2: { a: { bottom: 195, left: 107, width: 77 }, b: { bottom: 180, left: 122, width: 75 } },
    3: { a: { bottom: 190, left: 98, width: 77 },  b: { bottom: 176, left: 116, width: 75 } },
    4: { a: { bottom: 190, left: 98, width: 77 },  b: { bottom: 176, left: 116, width: 75 } },
    5: { a: { bottom: 188, left: 98, width: 77 },  b: { bottom: 174, left: 116, width: 75 } },
  };
  const fp = facePositions[attitude] || facePositions[3];

  layers.push({
    key: "face_a",
    src: `${IMG_BASE}/result_face_${attitude}_a.png`,
    bottom: fp.a.bottom, left: fp.a.left, width: fp.a.width,
  });
  layers.push({
    key: "face_b",
    src: `${IMG_BASE}/result_face_${attitude}_b.png`,
    bottom: fp.b.bottom, left: fp.b.left, width: fp.b.width,
  });

  // 8. Pull person with rope (ロープ)
  //    CSS: bottom: 103px; left: 455px; width: 123px
  layers.push({
    key: "pull",
    src: `${IMG_BASE}/result_pull${rope}.png`,
    bottom: 103, left: 455, width: 123,
  });

  // 9. Staff3 (foreground, two people sitting on wagon)
  //    CSS: bottom: 176px; left: 210px; width: 100px
  if (diversity >= 4) {
    layers.push({
      key: "staff3",
      src: `${IMG_BASE}/result_staff3.png`,
      bottom: 176, left: 210, width: 100,
    });
  }

  // 10. Happiness (幸福度)
  //    CSS: bottom: 310px; left: 16px; width: 102px
  //    (原本は355pxだが、355+画像高さ>420pxではみ出すため310pxに調整)
  layers.push({
    key: "happiness",
    src: `${IMG_BASE}/result_happiness${happiness}.png`,
    bottom: 310, left: 16, width: 102,
  });

  // 11. Copyright
  //    CSS: bottom: 20px; left: 243px; width: 233px
  layers.push({
    key: "copyright",
    src: `${IMG_BASE}/result_copyright.png`,
    bottom: 20, left: 243, width: 233,
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
      {/* Composite wagon illustration - matches reference site exactly */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
        style={{ aspectRatio: `${CONTAINER_W} / ${CONTAINER_H}` }}
      >
        {layers.map((layer, i) => (
          <img
            key={layer.key}
            src={layer.src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              // Background layer uses top:0, all others use bottom positioning
              ...(layer.key === "background"
                ? { top: 0, left: 0, width: `${(layer.width / CONTAINER_W) * 100}%` }
                : {
                    bottom: `${(layer.bottom / CONTAINER_H) * 100}%`,
                    left: `${(layer.left / CONTAINER_W) * 100}%`,
                    width: `${(layer.width / CONTAINER_W) * 100}%`,
                  }),
              zIndex: i + 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
