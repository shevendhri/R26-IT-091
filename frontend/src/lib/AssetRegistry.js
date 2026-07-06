import React, { useMemo } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AssetRegistry handles mapping logical item names to either:
 * 1. Loaded GLB assets (if available in public/assets)
 * 2. High-quality procedural PBR fallbacks (if true GLBs are unavailable)
 */

export const ASSET_TYPES = {
  FURNITURE_BED: 'FURNITURE_BED',
  FURNITURE_SOFA: 'FURNITURE_SOFA',
  FURNITURE_TABLE: 'FURNITURE_TABLE',
  FURNITURE_CHAIR: 'FURNITURE_CHAIR',
  FURNITURE_DESK: 'FURNITURE_DESK',
  FURNITURE_TOILET: 'FURNITURE_TOILET',
  FURNITURE_CABINET: 'FURNITURE_CABINET',
  VEGETATION_TREE: 'VEGETATION_TREE',
  VEGETATION_BUSH: 'VEGETATION_BUSH',
  // New procedural items
  FURNITURE_RECEPTION_DESK: 'FURNITURE_RECEPTION_DESK',
  FURNITURE_PLANT_POT: 'FURNITURE_PLANT_POT',
  FURNITURE_CONFERENCE_TABLE: 'FURNITURE_CONFERENCE_TABLE',
  FURNITURE_DISPLAY_SCREEN: 'FURNITURE_DISPLAY_SCREEN',
  FURNITURE_WHITEBOARD: 'FURNITURE_WHITEBOARD',
  FURNITURE_KITCHENETTE: 'FURNITURE_KITCHENETTE',
  FURNITURE_SINK: 'FURNITURE_SINK',
  FURNITURE_RESTROOM_CUBICLE: 'FURNITURE_RESTROOM_CUBICLE',
  FURNITURE_MIRROR: 'FURNITURE_MIRROR',
  FURNITURE_TV: 'FURNITURE_TV',
  INDUSTRIAL_RACK: 'INDUSTRIAL_RACK',
  INDUSTRIAL_EQUIPMENT: 'INDUSTRIAL_EQUIPMENT',
  INDUSTRIAL_PALLET: 'INDUSTRIAL_PALLET',
  // Architectural Elements
  WINDOW_CASEMENT: 'WINDOW_CASEMENT',
  WINDOW_CURTAIN_WALL: 'WINDOW_CURTAIN_WALL',
  WINDOW_STOREFRONT: 'WINDOW_STOREFRONT',
  WINDOW_RIBBON: 'WINDOW_RIBBON',
  DOOR_DOUBLE_GLASS: 'DOOR_DOUBLE_GLASS',
  DOOR_PIVOT: 'DOOR_PIVOT',
  CANOPY_MODERN: 'CANOPY_MODERN'
};

export function getPBRMaterial(materialName, baseColor = '#cccccc', roughness = 0.7, metalness = 0.1) {
  // If we had real textures, we would map them here:
  // const textures = useTexture({ map: '/assets/mat_diffuse.jpg', normalMap: '/assets/mat_normal.jpg' });
  // For now, return dynamic procedural physical properties based on material name
  
  const matNameLower = (materialName || '').toLowerCase();
  
  let pbrConfig = {
    color: baseColor,
    roughness: roughness,
    metalness: metalness,
    clearcoat: 0,
    clearcoatRoughness: 0
  };

  if (matNameLower.includes('glass')) {
    pbrConfig = { color: '#88ccff', roughness: 0.1, metalness: 0.9, transmission: 0.9, transparent: true, opacity: 0.6, ior: 1.5 };
  } else if (matNameLower.includes('steel') || matNameLower.includes('aluminum')) {
    pbrConfig = { color: '#888888', roughness: 0.3, metalness: 0.8, clearcoat: 0.5 };
  } else if (matNameLower.includes('timber') || matNameLower.includes('wood')) {
    pbrConfig = { color: '#8b5a2b', roughness: 0.8, metalness: 0.05 };
  } else if (matNameLower.includes('brick') || matNameLower.includes('clay')) {
    pbrConfig = { color: '#b22222', roughness: 0.9, metalness: 0.0 };
  } else if (matNameLower.includes('concrete')) {
    pbrConfig = { color: '#999999', roughness: 0.9, metalness: 0.1 };
  } else if (matNameLower.includes('marble') || matNameLower.includes('porcelain')) {
    pbrConfig = { color: '#f0f8ff', roughness: 0.1, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.1 };
  }

  return pbrConfig;
}

export function ProceduralAsset({ type, scale = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0], color = '#ffffff' }) {
  // Renders a high-quality procedural representation of furniture if GLBs are missing
  const meshes = useMemo(() => {
    switch (type) {
      case ASSET_TYPES.FURNITURE_BED:
        return (
          <group>
            {/* Frame - Light Oak */}
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.4, 2.0]} />
              <meshStandardMaterial color="#d2b48c" roughness={0.7} />
            </mesh>
            {/* Mattress - White */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.2, 1.9]} />
              <meshStandardMaterial color="#fdfcfb" roughness={0.9} />
            </mesh>
            {/* Pillows */}
            <mesh position={[-0.35, 0.65, -0.7]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.1, 0.3]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
            </mesh>
            <mesh position={[0.35, 0.65, -0.7]} castShadow receiveShadow>
              <boxGeometry args={[0.5, 0.1, 0.3]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_SOFA:
        return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.4, 0.8]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.6, -0.3]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.6, 0.2]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            {/* Armrests */}
            <mesh position={[-0.9, 0.5, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.4, 0.6]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
            <mesh position={[0.9, 0.5, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[0.2, 0.4, 0.6]} />
              <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_TABLE:
        return (
          <group>
            {/* Top - Light Oak */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.05, 0.8]} />
              <meshStandardMaterial color="#dcd0c0" roughness={0.5} />
            </mesh>
            {/* Legs - White metal */}
            {[[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow receiveShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.75, 8]} />
                <meshStandardMaterial color="#f8f8f8" metalness={0.2} roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      case ASSET_TYPES.FURNITURE_CHAIR:
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.7, -0.175]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.4, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* Legs - Light Oak */}
            {[[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.225, pos[1]]} castShadow receiveShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.45, 8]} />
                <meshStandardMaterial color="#d2b48c" roughness={0.7} />
              </mesh>
            ))}
          </group>
        );
      case ASSET_TYPES.FURNITURE_DESK:
        return (
          <group>
             {/* Top - White */}
             <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.05, 0.6]} />
              <meshStandardMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            {/* Legs - Light Oak */}
            {[[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow receiveShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.75, 8]} />
                <meshStandardMaterial color="#d2b48c" roughness={0.7} />
              </mesh>
            ))}
          </group>
        );
      case ASSET_TYPES.VEGETATION_TREE:
        return (
          <group>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.3, 3, 7]} />
              <meshStandardMaterial color="#4a3b32" roughness={0.9} />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1.5, 1]} />
              <meshStandardMaterial color="#2d4c1e" roughness={0.8} />
            </mesh>
            <mesh position={[0.8, 2.8, 0.5]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1.2, 1]} />
              <meshStandardMaterial color="#3a5f27" roughness={0.8} />
            </mesh>
            <mesh position={[-0.6, 3.0, -0.7]} castShadow receiveShadow>
              <dodecahedronGeometry args={[1.3, 1]} />
              <meshStandardMaterial color="#3a5f27" roughness={0.8} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_TOILET:
         return (
          <group>
            {/* Base */}
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.4, 0.5]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
            </mesh>
            {/* Tank */}
            <mesh position={[0, 0.6, -0.15]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.4, 0.2]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} clearcoat={1.0} />
            </mesh>
          </group>
         );
      case ASSET_TYPES.FURNITURE_CABINET:
        return (
          <group>
             {/* Body - Clean White/Light Grey */}
             <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.9, 0.6]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
             {/* Countertop - White Marble/Quartz */}
             <mesh position={[0, 0.925, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.85, 0.05, 0.65]} />
              <meshStandardMaterial color="#fdfbf9" roughness={0.2} metalness={0.05} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.WINDOW_CASEMENT:
        return (
          <group>
            {/* Outer Frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.2, 1.4, 0.1]} />
              <meshStandardMaterial color="#d4d4d4" roughness={0.3} metalness={0.4} />
            </mesh>
            {/* Inner Glass */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.1, 1.3, 0.05]} />
              <meshPhysicalMaterial color="#eef6fa" transmission={0.95} transparent opacity={0.6} roughness={0.05} ior={1.5} />
            </mesh>
            {/* Mullion */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.04, 1.4, 0.12]} />
              <meshStandardMaterial color="#d4d4d4" roughness={0.3} metalness={0.4} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.WINDOW_CURTAIN_WALL:
        return (
          <group>
            {/* Massive glass panel */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 3.0, 0.05]} />
              <meshPhysicalMaterial color="#eef6fa" transmission={0.95} transparent opacity={0.5} roughness={0.05} metalness={0.1} ior={1.5} />
            </mesh>
            {/* Aluminum grid framing */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.5, 3.0, 0.1]} />
              <meshStandardMaterial color="#d4d4d4" wireframe />
            </mesh>
          </group>
        );
      case ASSET_TYPES.WINDOW_STOREFRONT:
        return (
          <group>
            {/* Glass panel */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3.0, 2.5, 0.05]} />
              <meshPhysicalMaterial color="#eef6fa" transmission={0.95} transparent opacity={0.5} roughness={0.05} metalness={0.1} ior={1.5} />
            </mesh>
            {/* Thick aluminum header/footer */}
            <mesh position={[0, 1.25, 0.02]}>
              <boxGeometry args={[3.0, 0.15, 0.15]} />
              <meshStandardMaterial color="#d4d4d4" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, -1.25, 0.02]}>
              <boxGeometry args={[3.0, 0.15, 0.15]} />
              <meshStandardMaterial color="#d4d4d4" roughness={0.4} metalness={0.6} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.WINDOW_RIBBON:
        return (
          <group>
            {/* Long thin glass */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[4.0, 0.8, 0.05]} />
              <meshPhysicalMaterial color="#eef6fa" transmission={0.9} transparent opacity={0.6} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[4.0, 0.8, 0.1]} />
              <meshStandardMaterial color="#d4d4d4" wireframe />
            </mesh>
          </group>
        );
      case ASSET_TYPES.DOOR_DOUBLE_GLASS:
        return (
          <group>
            {/* Frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.2, 2.4, 0.15]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Glass doors */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[2.0, 2.3, 0.05]} />
              <meshPhysicalMaterial color="#eef6fa" transmission={0.95} transparent opacity={0.5} roughness={0.05} ior={1.5} />
            </mesh>
            {/* Center Mullion / Split */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.05, 2.4, 0.16]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Pull handles */}
            <mesh position={[-0.15, 0, 0.1]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8]} />
              <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0.15, 0, 0.1]}>
              <cylinderGeometry args={[0.02, 0.02, 0.8]} />
              <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.DOOR_PIVOT:
        return (
          <group>
            {/* Frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.6, 2.6, 0.15]} />
              <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Solid Wood Pivot Door */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.5, 2.5, 0.08]} />
              <meshStandardMaterial color="#d2b48c" roughness={0.6} />
            </mesh>
            {/* Handle */}
            <mesh position={[0.6, 0, 0.08]}>
              <boxGeometry args={[0.04, 1.2, 0.04]} />
              <meshStandardMaterial color="#888" roughness={0.4} metalness={0.8} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.CANOPY_MODERN:
        return (
          <group>
            {/* Thin floating roof */}
            <mesh position={[0, 0.1, 1.5]} castShadow>
              <boxGeometry args={[4.0, 0.2, 3.0]} />
              <meshStandardMaterial color="#fff" roughness={0.4} />
            </mesh>
            {/* Thin columns */}
            <mesh position={[-1.8, -1.5, 2.8]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
              <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.5} />
            </mesh>
            <mesh position={[1.8, -1.5, 2.8]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 3.0, 8]} />
              <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.5} />
            </mesh>
          </group>
        );
      // ---- New Asset Types ----------------------------------------------------
      case ASSET_TYPES.FURNITURE_RECEPTION_DESK:
        return (
          <group>
            {/* Desk Top */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.05, 1.0]} />
              <meshStandardMaterial color="#d2b48c" roughness={0.6} />
            </mesh>
            {/* Legs */}
            {[[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8b5a2b" metalness={0.2} roughness={0.5} />
              </mesh>
            ))}
          </group>
        );
      case ASSET_TYPES.FURNITURE_PLANT_POT:
        return (
          <group>
            {/* Pot */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.4, 12]} />
              <meshStandardMaterial color="#6b8e23" roughness={0.7} />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.4, 8, 8]} />
              <meshStandardMaterial color="#228b22" roughness={0.5} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_CONFERENCE_TABLE:
        return (
          <group>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.5, 0.08, 1.2]} />
              <meshStandardMaterial color="#c9a26b" roughness={0.5} />
            </mesh>
            {/* Legs */}
            {[[-1.0, -0.5], [1.0, -0.5], [-1.0, 0.5], [1.0, 0.5]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.375, pos[1]]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.75, 8]} />
                <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      case ASSET_TYPES.FURNITURE_DISPLAY_SCREEN:
        return (
          <group>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.9, 0.05]} />
              <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_WHITEBOARD:
        return (
          <group>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.9, 0.05]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.1} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_KITCHENETTE:
        return (
          <group>
            {/* Countertop */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.07, 0.6]} />
              <meshStandardMaterial color="#dcd0c0" roughness={0.5} />
            </mesh>
            {/* Base cabinets */}
            <mesh position={[0, 0.4, -0.35]} castShadow receiveShadow>
              <boxGeometry args={[1.8, 0.8, 0.3]} />
              <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_SINK:
        return (
          <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.2, 0.4]} />
              <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.2} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_RESTROOM_CUBICLE:
        return (
          <group>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.9, 0.6]} />
              <meshStandardMaterial color="#e5e5e5" roughness={0.4} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.FURNITURE_MIRROR:
        return (
          <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
            <planeGeometry args={[0.6, 0.9]} />
            <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0} transmission={0.9} transparent opacity={0.6} />
          </mesh>
        );
      case ASSET_TYPES.FURNITURE_TV:
        return (
          <group>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.8, 0.05]} />
              <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      case ASSET_TYPES.INDUSTRIAL_RACK:
        return (
          <group>
            {/* Vertical Supports */}
            {[0, 1].map((i) => (
              <mesh key={i} position={[-0.3 + i * 0.6, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 3.0, 0.3]} />
                <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.4} />
              </mesh>
            ))}
            {/* Shelves */}
            {[0.5, 1.5, 2.5].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.1, 0.3]} />
                <meshStandardMaterial color="#777777" metalness={0.6} roughness={0.5} />
              </mesh>
            ))}
          </group>
        );
      default:
        return (
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
    }
  }, [type, color]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {meshes}
    </group>
  );
}

export function generateRoomFurniture(roomLabel, w, h) {
  const assets = [];
  const lbl = (roomLabel || '').toLowerCase();
  const area = w * h;
  // Heuristic building type detection
  const isCommercial = ['lobby', 'reception', 'meeting', 'office', 'conference', 'washroom', 'restroom', 'break', 'staff'].some(k => lbl.includes(k));
  const isResidential = ['living', 'bedroom', 'dining', 'kitchen', 'family'].some(k => lbl.includes(k));
  const isEducational = ['classroom', 'lecture', 'lab'].some(k => lbl.includes(k));
  const isHospitality = ['guest', 'hotel', 'suite', 'reception'].some(k => lbl.includes(k));
  const isIndustrial = ['warehouse', 'industrial', 'factory', 'store', 'storage', 'utility'].some(k => lbl.includes(k));
  const densityFactor = isCommercial ? 0.2 : isResidential ? 0.15 : isEducational ? 0.12 : isHospitality ? 0.18 : isIndustrial ? 0.1 : 0.05;
  const maxItems = Math.max(1, Math.floor(area * densityFactor));

  const add = (type, pos, rot = [0,0,0], color = '#ffffff') => assets.push({ type, pos, rot, color });

  // Specific room setups
  if (lbl.includes('lobby') || lbl.includes('reception')) {
    // Reception desk centered
    add(ASSET_TYPES.FURNITURE_RECEPTION_DESK, [0, 0, h/2 - 1.0], [0,0,0], '#d2b48c');
    // Indoor plants
    add(ASSET_TYPES.FURNITURE_PLANT_POT, [-w/3, 0, h/2 - 0.5], [0,0,0], '#6b8e23');
    add(ASSET_TYPES.FURNITURE_PLANT_POT, [w/3, 0, h/2 - 0.5], [0,0,0], '#6b8e23');
  } else if (lbl.includes('meeting') || lbl.includes('conference')) {
    add(ASSET_TYPES.FURNITURE_CONFERENCE_TABLE, [0,0,0], [0,0,0], '#c9a26b');
    const chairCount = 6;
    for (let i = 0; i < chairCount; i++) {
      const angle = (i / chairCount) * Math.PI * 2;
      const radius = Math.min(w, h) / 3;
      add(ASSET_TYPES.FURNITURE_CHAIR, [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    add(ASSET_TYPES.FURNITURE_DISPLAY_SCREEN, [0, 0.8, -h/4], [0,0,0]);
  } else if (lbl.includes('office') || lbl.includes('work') || lbl.includes('study')) {
    add(ASSET_TYPES.FURNITURE_DESK, [0,0,0]);
    add(ASSET_TYPES.FURNITURE_CHAIR, [0,0,0.8], [0,Math.PI,0]);
    add(ASSET_TYPES.FURNITURE_WHITEBOARD, [w/2 - 0.2, 1.2, 0], [0,Math.PI/2,0]);
  } else if (lbl.includes('break') || lbl.includes('staff')) {
    // Break room/kitchenette
    add(ASSET_TYPES.FURNITURE_KITCHENETTE, [0,0,0]);
    add(ASSET_TYPES.FURNITURE_SINK, [w/4,0,0]);
    add(ASSET_TYPES.FURNITURE_TABLE, [-w/3,0,0]);
    add(ASSET_TYPES.FURNITURE_CHAIR, [-w/3,0,0.5]);
    add(ASSET_TYPES.FURNITURE_CHAIR, [-w/3,0,-0.5]);
  } else if (lbl.includes('restroom') || lbl.includes('wash') || lbl.includes('toilet') || lbl.includes('wc')) {
    add(ASSET_TYPES.FURNITURE_RESTROOM_CUBICLE, [-w/3,0,0]);
    add(ASSET_TYPES.FURNITURE_SINK, [w/3,0,0]);
    add(ASSET_TYPES.FURNITURE_MIRROR, [0,1,0]);
  } else if (lbl.includes('living') || lbl.includes('lounge')) {
    add(ASSET_TYPES.FURNITURE_SOFA, [0,0,0], [0,Math.PI,0]);
    add(ASSET_TYPES.FURNITURE_TABLE, [0,0,-1], [0,0,0]);
    add(ASSET_TYPES.FURNITURE_TV, [w/2 - 0.5,1,0]);
  } else if (lbl.includes('dining')) {
    add(ASSET_TYPES.FURNITURE_TABLE, [0,0,0]);
    const offsets = [[-0.8,0,-0.5],[0.8,0,-0.5],[-0.8,0,0.5],[0.8,0,0.5]];
    offsets.forEach(p => add(ASSET_TYPES.FURNITURE_CHAIR, p));
  } else if (lbl.includes('bed')) {
    add(ASSET_TYPES.FURNITURE_BED, [0,0,0]);
    add(ASSET_TYPES.FURNITURE_TV, [w/2 - 0.5,1,0]);
    add(ASSET_TYPES.FURNITURE_CABINET, [-w/2 + 0.5,0,0], [0,Math.PI/2,0]);
  } else if (lbl.includes('kitchen') || lbl.includes('pantry')) {
    add(ASSET_TYPES.FURNITURE_KITCHENETTE, [0,0,0]);
    add(ASSET_TYPES.FURNITURE_SINK, [-w/3,0,0]);
    add(ASSET_TYPES.FURNITURE_TABLE, [w/3,0,0]); // island if space permits
  } else if (lbl.includes('classroom')) {
    add(ASSET_TYPES.FURNITURE_TABLE, [0,0,0]); // student desk placeholder
    add(ASSET_TYPES.FURNITURE_CHAIR, [0,0,0.5]);
    add(ASSET_TYPES.FURNITURE_WHITEBOARD, [w/2 - 0.2,1.2,0], [0,Math.PI/2,0]);
  } else if (lbl.includes('lecture')) {
    const rows = 4, cols = 6;
    const seatX = w / (cols + 1);
    const seatZ = h / (rows + 1);
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        add(ASSET_TYPES.FURNITURE_CHAIR, [c * seatX - w/2, 0, r * seatZ - h/2]);
      }
    }
    add(ASSET_TYPES.FURNITURE_DISPLAY_SCREEN, [0,1.5,-h/2 + 1]);
  } else if (lbl.includes('guest') || lbl.includes('hotel')) {
    add(ASSET_TYPES.FURNITURE_BED, [0,0,0]);
    add(ASSET_TYPES.FURNITURE_TV, [w/2 - 0.5,1,0]);
    add(ASSET_TYPES.FURNITURE_CABINET, [-w/2 + 0.5,0,0], [0,Math.PI/2,0]);
  } else if (lbl.includes('warehouse') || lbl.includes('industrial') || lbl.includes('store') || lbl.includes('utility')) {
    const rackCount = Math.min(3, Math.floor(area/10));
    for (let i = 0; i < rackCount; i++) {
      const xPos = -w/2 + (i + 1) * (w / (rackCount + 1));
      add(ASSET_TYPES.INDUSTRIAL_RACK, [xPos,0,0]);
    }
  }

  // Fill remaining capacity with generic chairs for visual density
  while (assets.length < maxItems) {
    const randX = (Math.random() - 0.5) * w * 0.8;
    const randZ = (Math.random() - 0.5) * h * 0.8;
    add(ASSET_TYPES.FURNITURE_CHAIR, [randX, 0, randZ]);
  }

  return assets;
}
