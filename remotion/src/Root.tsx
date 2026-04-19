import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 30 fps. Total: 5 scenes (~7s each) + transitions
// Scenes: 210 + 240 + 210 + 240 + 210 = 1110 frames raw
// Transitions: 4 × 20 frames overlap = -80
// Final: 1030 frames ≈ 34s
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={1030}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
