import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, SMAA, Vignette, Bloom } from '@react-three/postprocessing';
import Furniture from './Furniture';

// ==== SIMPLE FURNITURE PRIMITIVES (stylized) ====
const Rug = ({ position, scale = 1 }) => (
  <mesh position={position} rotation-x={-Math.PI / 2} scale={scale} receiveShadow>
    <planeGeometry args={[2.5, 2.5]} />
    <meshStandardMaterial color="#cba893" roughness={0.8} metalness={0.1} />
  </mesh>
);

const Table = ({ position }) => (
  <group position={position} castShadow>
    <mesh>
      <boxGeometry args={[1.8, 0.1, 1.0]} />
      <meshStandardMaterial color="#c9b79c" roughness={0.6} metalness={0.05} />
    </mesh>
    {/* legs */}
    {[[-0.8, -0.55, -0.45], [0.8, -0.55, -0.45], [-0.8, -0.55, 0.45], [0.8, -0.55, 0.45]].map((pos, i) => (
      <mesh key={i} position={pos} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
    ))}
  </group>
);

const Sofa = ({ position }) => (
  <group position={position} castShadow>
    <mesh>
      <boxGeometry args={[2.2, 0.6, 0.9]} />
      <meshStandardMaterial color="#d1c4b4" roughness={0.5} metalness={0.1} />
    </mesh>
    {/* cushions */}
    {[[-0.7, 0.35, 0], [0.7, 0.35, 0]].map((pos, i) => (
      <mesh key={i} position={pos} castShadow>
        <boxGeometry args={[0.6, 0.2, 0.75]} />
        <meshStandardMaterial color="#e8e0d6" roughness={0.3} />
      </mesh>
    ))}
  </group>
);

const Chair = ({ position }) => (
  <group position={position} castShadow>
    <mesh>
      <boxGeometry args={[0.6, 0.1, 0.6]} />
      <meshStandardMaterial color="#c9b79c" roughness={0.6} />
    </mesh>
    {/* back */}
    <mesh position={[0, 0.35, -0.25]}>
      <boxGeometry args={[0.6, 0.7, 0.1]} />
      <meshStandardMaterial color="#c9b79c" roughness={0.6} />
    </mesh>
    {/* legs */}
    {[[-0.25, -0.55, -0.25], [0.25, -0.55, -0.25], [-0.25, -0.55, 0.25], [0.25, -0.55, 0.25]].map((pos, i) => (
      <mesh key={i} position={pos} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
    ))}
  </group>
);

const Plant = ({ position }) => (
  <group position={position} castShadow>
    <mesh>
      <coneGeometry args={[0.25, 0.8, 8]} />
      <meshStandardMaterial color="#2a8" />
    </mesh>
    <mesh position={[0, -0.4, 0]}>
      <cylinderGeometry args={[0.35, 0.35, 0.2, 8]} />
      <meshStandardMaterial color="#228b22" />
    </mesh>
  </group>
);

const Curtain = ({ position, scale = 1 }) => (
  <group position={position} scale={scale} castShadow>
    <mesh>
      <planeGeometry args={[2.4, 2.2]} />
      <meshStandardMaterial color="#f5e6d2" roughness={0.75} metalness={0} opacity={0.85} transparent />
    </mesh>
  </group>
);

// ==== HOUSE (cut‑away dollhouse) ====
const House = () => {
  const wallMat = useMemo(() => (
    <meshStandardMaterial color="#f0e5d8" roughness={0.6} metalness={0} />
  ), []);


  return (
    <group>
      {/* floor */}
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#d9c5a0" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* back wall (cutaway) */}
      <mesh position={[0, 1.5, -3]} castShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        {wallMat}
      </mesh>

      {/* side walls */}
      <mesh position={[-3, 1.5, 0]} rotation-y={Math.PI / 2} castShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        {wallMat}
      </mesh>
      <mesh position={[3, 1.5, 0]} rotation-y={Math.PI / 2} castShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        {wallMat}
      </mesh>

        <Furniture />
    </group>
  );
};

// ==== LANDSCAPING ====
const Landscape = () => {
  // simple hedges using low‑poly boxes
  const hedge = (x, z) => (
    <mesh key={`${x}-${z}`} position={[x, 0.2, z]} castShadow>
      <boxGeometry args={[0.8, 0.4, 0.3]} />
      <meshStandardMaterial color="#5b8c5a" />
    </mesh>
  );

  // planters with stone material
  const planter = (x, z) => (
    <mesh key={`planter-${x}-${z}`} position={[x, 0.0, z]} castShadow>
      <boxGeometry args={[0.6, 0.2, 0.6]} />
      <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
    </mesh>
  );

  // walkway
  const walkway = (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 2]} receiveShadow>
      <planeGeometry args={[6, 2]} />
      <meshStandardMaterial color="#7d7d7d" roughness={0.7} />
    </mesh>
  );

  return (
    <group>
      {[...Array(6)].map((_, i) => hedge(-2.5 + i * 1.0, -4))}
      {[...Array(6)].map((_, i) => hedge(-2.5 + i * 1.0, 4))}
      {planter(-2, -2)}
      {planter(2, -2)}
      {planter(-2, 2)}
      {planter(2, 2)}
      {walkway}
    </group>
  );
};

export default function ArchVizScene() {
  // bright, soft daylight lighting
  const lights = useMemo(() => (
    <>
      {/* HDRI environment */}
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/royal_esplanade_1k.hdr" background={false} />
      {/* Soft directional sunlight */}
      <directionalLight color="#ffdfaa" intensity={2.0} position={[5, 12, 5]} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-far={60} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
      {/* Warm ambient fill */}
      <ambientLight intensity={0.4} />
      {/* Soft contact shadows for grounding */}
      <ContactShadows resolution={256} position={[0, 0.01, 0]} scale={10} blur={2.5} far={10} />
    </>
  ), []);

  return (
    <div className="canvas-wrapper" style={{ background: '#e5e0d5' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [8, 8, 8], fov: 28 }}>
        <fog attach="fog" args={["#e5e0d5", 5, 30]} />
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={28} />
          {lights}
          <EffectComposer>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
            <Vignette offset={0.1} darkness={1.2} />
          </EffectComposer>
          
          <House />
          <Landscape />
          
          <OrbitControls enableDamping dampingFactor={0.1} autoRotate autoRotateSpeed={0.1} rotateSpeed={0.3} maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 4} />
        </Suspense>
      </Canvas>
    </div>
  );
}
