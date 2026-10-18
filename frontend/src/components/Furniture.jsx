// src/components/Furniture.jsx

import React from 'react';
import { useWoodMaterial, useFabricMaterial, useStoneMaterial, useFloorMaterial, useWallMaterial } from './Materials';

// Simple stylized furniture components using material hooks
const Sofa = ({ position }) => {
  const fabricMat = useFabricMaterial('#e8e0d6');
  return (
    <group position={position} castShadow>
      <mesh geometry={new THREE.BoxGeometry(2.2, 0.6, 0.9)}>
        <primitive object={fabricMat} attach="material" />
      </mesh>
      {/* Cushions */}
      {[[-0.7, 0.35, 0], [0.7, 0.35, 0]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.6, 0.2, 0.75]} />
          <meshStandardMaterial color="#fff" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Table = ({ position }) => {
  const woodMat = useWoodMaterial();
  return (
    <group position={position} castShadow>
      <mesh>
        <boxGeometry args={[1.8, 0.1, 1.0]} />
        <primitive object={woodMat} attach="material" />
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
};

const Chair = ({ position }) => {
  const woodMat = useWoodMaterial();
  return (
    <group position={position} castShadow>
      <mesh>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <primitive object={woodMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.35, -0.25]}>
        <boxGeometry args={[0.6, 0.7, 0.1]} />
        <primitive object={woodMat} attach="material" />
      </mesh>
      {[[-0.25, -0.55, -0.25], [0.25, -0.55, -0.25], [-0.25, -0.55, 0.25], [0.25, -0.55, 0.25]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      ))}
    </group>
  );
};

const Plant = ({ position }) => {
  const leafMat = useFabricMaterial('#2a8');
  const potMat = useStoneMaterial('#228b22');
  return (
    <group position={position} castShadow>
      <mesh>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <primitive object={leafMat} attach="material" />
      </mesh>
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 8]} />
        <primitive object={potMat} attach="material" />
      </mesh>
    </group>
  );
};

const Rug = ({ position }) => {
  const floorMat = useFloorMaterial('#cba893');
  return (
    <mesh position={position} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[2.5, 2.5]} />
      <primitive object={floorMat} attach="material" />
    </mesh>
  );
};

const Curtain = ({ position, scale = 1 }) => {
  const fabricMat = useFabricMaterial('#f5e6d2');
  return (
    <group position={position} scale={scale} castShadow>
      <mesh>
        <planeGeometry args={[2.4, 2.2]} />
        <primitive object={fabricMat} attach="material" />
      </mesh>
    </group>
  );
};

// Main Furniture component assembling a living‑room scene
export default function Furniture() {
  return (
    <group>
      {/* Rug */}
      <Rug position={[0, 0.01, 0]} />
      {/* Sofa */}
      <Sofa position={[-1.5, 0.35, -0.5]} />
      {/* Coffee table */}
      <Table position={[0, 0.05, 0]} />
      {/* Chairs */}
      <Chair position={[-1.2, 0.35, 1.0]} />
      <Chair position={[1.2, 0.35, 1.0]} />
      {/* Plant */}
      <Plant position={[2, 0, -1.5]} />
      {/* Curtain */}
      <Curtain position={[-2, 1.1, -2.9]} />
    </group>
  );
}
