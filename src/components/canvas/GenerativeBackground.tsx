import { Canvas } from '@react-three/fiber';
import { useDeckStore } from '../../store/useDeckStore';
import { effects } from './effects';

export function GenerativeBackground() {
  const backgroundEffect = useDeckStore((state) => state.backgroundEffect);
  const Effect = effects[backgroundEffect];
  
  return (
    <div className="w-full h-full absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-gray-900 to-black">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
      >
        {Effect && <Effect />}
      </Canvas>
    </div>
  );
}
