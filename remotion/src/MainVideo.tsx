import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadDM } from "@remotion/google-fonts/DMSerifDisplay";

import { SceneLanding } from "./scenes/SceneLanding";
import { SceneReportForm } from "./scenes/SceneReportForm";
import { SceneTracking } from "./scenes/SceneTracking";
import { SceneStaffDashboard } from "./scenes/SceneStaffDashboard";
import { SceneStats } from "./scenes/SceneStats";

loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadDM("normal", { weights: ["400"], subsets: ["latin"] });

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1020" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneLanding />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneReportForm />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneTracking />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneStaffDashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={210}>
          <SceneStats />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
