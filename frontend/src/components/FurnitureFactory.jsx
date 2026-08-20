// frontend/src/components/FurnitureFactory.jsx
"use client";
import React from "react";
import FurnitureLoader from "./FurnitureLoader";

/**
 * Procedural Fallback Meshes (designed with clean, neutral colors)
 */

function BedFallback() {
  return (
    <group>
      {/* Wood Frame */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.3, 2.0]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.4, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.25, 1.9]} />
        <meshStandardMaterial color="#f0ede9" roughness={0.8} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.4, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.35]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.35]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SofaFallback() {
  return (
    <group>
      {/* Base cushions */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.4, 0.85]} />
        <meshStandardMaterial color="#556b2f" roughness={0.8} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.55, -0.325]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.2]} />
        <meshStandardMaterial color="#4f622c" roughness={0.8} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.95, 0.4, 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.75]} />
        <meshStandardMaterial color="#4f622c" roughness={0.8} />
      </mesh>
      <mesh position={[0.95, 0.4, 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.75]} />
        <meshStandardMaterial color="#4f622c" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CoffeeTableFallback() {
  return (
    <group>
      {/* Glass Top */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.0, 0.04, 0.6]} />
        <meshPhysicalMaterial color="#cceeff" transparent opacity={0.5} roughness={0.1} transmission={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], 0.2, pos[1]]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function TVUnitFallback() {
  return (
    <group>
      {/* Lowboard Cabinet */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.4, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>
      {/* TV Screen */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.3, 0.75, 0.05]} />
        <meshStandardMaterial color="#080808" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* TV Stand */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function KitchenCounterFallback() {
  return (
    <group>
      {/* Cabinet Body */}
      <mesh position={[0, 0.425, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.85, 0.6]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} />
      </mesh>
      {/* Counter Top (Stone look) */}
      <mesh position={[0, 0.875, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.05, 0.65]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.3} />
      </mesh>
    </group>
  );
}

function CabinetsFallback() {
  return (
    <mesh castShadow>
      <boxGeometry args={[1.8, 0.6, 0.32]} />
      <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
    </mesh>
  );
}

function FridgeFallback() {
  return (
    <group>
      {/* Fridge body */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.8, 0.7]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Handles */}
      <mesh position={[0.3, 1.0, 0.36]} castShadow>
        <boxGeometry args={[0.03, 0.6, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function DiningTableFallback() {
  return (
    <group>
      {/* Top */}
      <mesh position={[0, 0.725, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.05, 0.9]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.65, -0.38], [0.65, -0.38], [-0.65, 0.38], [0.65, 0.38]].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], 0.35, pos[1]]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.7, 8]} />
          <meshStandardMaterial color="#3f1c0f" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function DiningChairFallback() {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.425, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.725, -0.185]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.04]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
      </mesh>
      {/* Legs */}
      {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], 0.2, pos[1]]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

function ToiletFallback() {
  return (
    <group>
      {/* Toilet Bowl */}
      <mesh position={[0, 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.36, 0.4, 0.55]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
      </mesh>
      {/* Water Tank */}
      <mesh position={[0, 0.6, -0.18]} castShadow>
        <boxGeometry args={[0.4, 0.45, 0.22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
      </mesh>
    </group>
  );
}

function SinkFallback() {
  return (
    <group>
      {/* Basin */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.55, 0.15, 0.42]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
      </mesh>
      {/* Stand Pedestal */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.7, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0, 0.9, -0.15]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.1]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function ShowerFallback() {
  return (
    <group>
      {/* Glass partitions */}
      <mesh position={[-0.45, 1.0, 0]} castShadow>
        <boxGeometry args={[0.02, 2.0, 0.9]} />
        <meshPhysicalMaterial color="#daeaf7" transparent opacity={0.3} roughness={0.05} transmission={0.9} />
      </mesh>
      <mesh position={[0, 1.0, -0.45]} castShadow>
        <boxGeometry args={[0.9, 2.0, 0.02]} />
        <meshPhysicalMaterial color="#daeaf7" transparent opacity={0.3} roughness={0.05} transmission={0.9} />
      </mesh>
      {/* Shower head */}
      <mesh position={[0, 1.85, -0.38]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function OfficeDeskFallback() {
  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, 0.725, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.05, 0.7]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
      {/* Side drawer cabinets */}
      <mesh position={[-0.45, 0.325, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.65, 0.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Leg (Right side) */}
      <mesh position={[0.6, 0.325, 0]} castShadow>
        <boxGeometry args={[0.05, 0.65, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>
    </group>
  );
}

function OfficeChairFallback() {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.46, 0.06, 0.46]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* High Backrest */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <boxGeometry args={[0.44, 0.75, 0.06]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Stand & base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.025, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function BookshelfFallback() {
  return (
    <group>
      {/* Outer frame */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.8, 0.3]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {/* Shelves slots */}
      {[0.4, 0.8, 1.2, 1.6].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0.02]} castShadow>
          <boxGeometry args={[0.82, 0.03, 0.26]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function TreadmillFallback() {
  return (
    <group>
      {/* Running belt base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.2, 1.6]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Front console panel */}
      <mesh position={[0, 1.0, -0.7]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.25]} />
        <meshStandardMaterial color="#374151" roughness={0.4} />
      </mesh>
      {/* Side handrails */}
      <mesh position={[-0.38, 0.6, -0.2]} castShadow>
        <boxGeometry args={[0.04, 0.9, 0.9]} wireframe />
        <meshStandardMaterial color="#1f2937" metalness={0.8} />
      </mesh>
      <mesh position={[0.38, 0.6, -0.2]} castShadow>
        <boxGeometry args={[0.04, 0.9, 0.9]} wireframe />
        <meshStandardMaterial color="#1f2937" metalness={0.8} />
      </mesh>
    </group>
  );
}

function ExerciseBenchFallback() {
  return (
    <group>
      {/* Padded bench */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.35, 0.08, 1.2]} />
        <meshStandardMaterial color="#1f2937" roughness={0.95} />
      </mesh>
      {/* Metal frame support */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.05, 0.3, 1.0]} />
        <meshStandardMaterial color="#4b5563" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.025, -0.5]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh position={[0, 0.025, 0.5]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
}

function StorageRackFallback() {
  return (
    <group>
      {/* Four upright metal posts */}
      {[[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]].map((pos, idx) => (
        <mesh key={idx} position={[pos[0], 0.95, pos[1]]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.9, 8]} />
          <meshStandardMaterial color="#4b5563" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Five wire shelves slots */}
      {[0.1, 0.5, 0.9, 1.3, 1.7].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.03, 0.48]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ReceptionDeskFallback() {
  return (
    <group>
      {/* Curved or L-shaped front screen */}
      <mesh position={[0, 0.5, -0.15]} castShadow>
        <boxGeometry args={[1.8, 1.0, 0.08]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>
      {/* Desktop counter */}
      <mesh position={[0, 0.74, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.04, 0.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
      </mesh>
      {/* Side supports */}
      <mesh position={[-0.86, 0.5, 0.0]} castShadow>
        <boxGeometry args={[0.08, 1.0, 0.6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0.86, 0.5, 0.0]} castShadow>
        <boxGeometry args={[0.08, 1.0, 0.6]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
    </group>
  );
}

function ConferenceTableFallback() {
  return (
    <group>
      {/* Large table surface */}
      <mesh position={[0, 0.725, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.06, 1.2]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.55} />
      </mesh>
      {/* Solid pedestal bases */}
      <mesh position={[-0.6, 0.33, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.66, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0.6, 0.33, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 0.66, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
    </group>
  );
}

function WhiteboardFallback() {
  return (
    <group>
      {/* Writing Board */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.6, 1.0, 0.03]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.1} />
      </mesh>
      {/* Outer frame */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.66, 1.06, 0.04]} wireframe />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
    </group>
  );
}

function PlantFallback() {
  return (
    <group>
      {/* Ceramic Pot */}
      <mesh position={[0, 0.225, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.45, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      {/* Green foliage sphere layers */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.34, 10, 10]} />
        <meshStandardMaterial color="#15803d" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.95, -0.1]} castShadow>
        <sphereGeometry args={[0.24, 8, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>
      <mesh position={[-0.12, 0.92, 0.12]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.6} />
      </mesh>
    </group>
  );
}

function GrabBarFallback() {
  return (
    <mesh castShadow>
      <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
    </mesh>
  );
}

function NightstandFallback() {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.48, 0.48, 0.48]} />
      <meshStandardMaterial color="#a1a1aa" roughness={0.6} />
    </mesh>
  );
}

function WardrobeFallback() {
  return (
    <group>
      {/* Main wooden cabinet body */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.8, 0.58]} />
        <meshStandardMaterial color="#271b12" roughness={0.7} />
      </mesh>
      {/* Double door line separator detail */}
      <mesh position={[0, 0.9, 0.2925]} castShadow>
        <boxGeometry args={[0.01, 1.8, 0.005]} />
        <meshStandardMaterial color="#120c08" />
      </mesh>
    </group>
  );
}

/**
 * Main Factory function mapping logical names to GLB loading URLs
 * or falling back to custom styled procedural geometric representations.
 */
export default function FurnitureFactory({ name, ...props }) {
  const modelUrl = `/models/furniture/${name}.glb`;

  // Fallback selector
  let fallbackComponent = null;

  switch (name) {
    case "bed":
      fallbackComponent = <BedFallback />;
      break;
    case "sofa":
      fallbackComponent = <SofaFallback />;
      break;
    case "coffee_table":
      fallbackComponent = <CoffeeTableFallback />;
      break;
    case "tv_unit":
      fallbackComponent = <TVUnitFallback />;
      break;
    case "kitchen_counter":
      fallbackComponent = <KitchenCounterFallback />;
      break;
    case "cabinets":
      fallbackComponent = <CabinetsFallback />;
      break;
    case "fridge":
      fallbackComponent = <FridgeFallback />;
      break;
    case "dining_table":
      fallbackComponent = <DiningTableFallback />;
      break;
    case "dining_chair":
      fallbackComponent = <DiningChairFallback />;
      break;
    case "toilet":
      fallbackComponent = <ToiletFallback />;
      break;
    case "sink":
      fallbackComponent = <SinkFallback />;
      break;
    case "shower":
      fallbackComponent = <ShowerFallback />;
      break;
    case "office_desk":
      fallbackComponent = <OfficeDeskFallback />;
      break;
    case "office_chair":
      fallbackComponent = <OfficeChairFallback />;
      break;
    case "bookshelf":
      fallbackComponent = <BookshelfFallback />;
      break;
    case "treadmill":
      fallbackComponent = <TreadmillFallback />;
      break;
    case "exercise_bench":
      fallbackComponent = <ExerciseBenchFallback />;
      break;
    case "storage_rack":
      fallbackComponent = <StorageRackFallback />;
      break;
    case "reception_desk":
      fallbackComponent = <ReceptionDeskFallback />;
      break;
    case "conference_table":
      fallbackComponent = <ConferenceTableFallback />;
      break;
    case "whiteboard":
      fallbackComponent = <WhiteboardFallback />;
      break;
    case "plant":
      fallbackComponent = <PlantFallback />;
      break;
    case "grab_bar":
      fallbackComponent = <GrabBarFallback />;
      break;
    case "nightstand":
      fallbackComponent = <NightstandFallback />;
      break;
    case "wardrobe":
      fallbackComponent = <WardrobeFallback />;
      break;
    default:
      fallbackComponent = (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      );
      break;
  }

  return (
    <group position={props.position} rotation={props.rotation} scale={props.scale}>
      <FurnitureLoader
        url={modelUrl}
        fallback={fallbackComponent}
      />
    </group>
  );
}
