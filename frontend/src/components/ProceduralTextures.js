"use client";
import * as THREE from 'three';

// ══════════════════════════════════════════════════════════════════════════════
//  CANVAS TEXTURE GENERATORS
// ══════════════════════════════════════════════════════════════════════════════

// Helper to create a simple color texture
function createColorTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 4;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 4, 4);
  return new THREE.CanvasTexture(canvas);
}

// Helper to repeat a texture
function repeatTexture(texture, repeats = 4) {
  const tex = texture.clone();
  tex.repeat.set(repeats, repeats);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.needsUpdate = true;
  return tex;
}

// CSEB canvas generator: block masonry grid with aggregate noise
function createCSEBTexture() {
  if (typeof document === 'undefined') return createColorTexture('#b3825f');
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base earthy brown-orange
  ctx.fillStyle = '#b3825f';
  ctx.fillRect(0, 0, 512, 512);

  // Sand noise
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 1.5 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(254, 215, 170, 0.22)' : 'rgba(67, 40, 20, 0.25)';
    ctx.fillRect(x, y, size, size);
  }

  // Draw blocks (course grid)
  const rows = 16;
  const cols = 8;
  const rowH = 512 / rows;
  const colW = 512 / cols;

  ctx.strokeStyle = 'rgba(240, 220, 200, 0.35)'; // light mortar joints
  ctx.lineWidth = 2.5;

  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * rowH);
    ctx.lineTo(512, r * rowH);
    ctx.stroke();

    if (r < rows) {
      const offset = (r % 2) * (colW / 2);
      for (let c = -1; c <= cols + 1; c++) {
        ctx.beginPath();
        ctx.moveTo(c * colW + offset, r * rowH);
        ctx.lineTo(c * colW + offset, (r + 1) * rowH);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 16;
  return texture;
}

// Timber wood-grain canvas generator
function createTimberTexture() {
  if (typeof document === 'undefined') return createColorTexture('#8b5a2b');
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#5a3d1c';
  ctx.lineWidth = 2;
  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    const startY = (i * 14) - 60;
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(128, startY + 20 * Math.sin(i), 384, startY - 20 * Math.sin(i), 512, startY);
    ctx.stroke();
  }

  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = 'rgba(80, 50, 20, 0.18)';
    ctx.fillRect(x, y, 1.2, Math.random() * 4 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 16;
  return texture;
}

// Recycled Rubber crumb canvas generator
function createRubberTexture() {
  if (typeof document === 'undefined') return createColorTexture('#1a1a1b');
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a1a1b';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 1.5 + 0.5;
    const rand = Math.random();
    ctx.fillStyle = rand > 0.8
      ? 'rgba(255, 255, 255, 0.3)' 
      : (rand > 0.55 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(148, 163, 184, 0.3)');
    ctx.fillRect(x, y, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 16;
  return texture;
}

// Grass/vegetation canvas generator for Green Roof
function createGrassTexture() {
  if (typeof document === 'undefined') return createColorTexture('#1b4332');
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1b4332';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = Math.random() * 9 + 4;
    const angle = (Math.random() - 0.5) * 0.45;
    ctx.strokeStyle = Math.random() > 0.4 ? '#40916c' : '#74c69d';
    ctx.lineWidth = Math.random() * 1.6 + 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len * Math.sin(angle), y - len * Math.cos(angle));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  texture.anisotropy = 16;
  return texture;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TEXTURE REGISTRY
// ══════════════════════════════════════════════════════════════════════════════

const TEXTURE_REGISTRY = {
  grass: () => createGrassTexture(),
  paving: (color) => repeatTexture(createColorTexture(color || '#94a3b8'), 8),
  brick: (color) => repeatTexture(createColorTexture(color || '#c87941'), 8),
  wood: (color) => repeatTexture(createColorTexture(color || '#8b5a2b'), 6),
  concrete_roof: (color) => repeatTexture(createColorTexture(color || '#9ca3af'), 4),
  cseb: () => createCSEBTexture(),
  timber: () => createTimberTexture(),
  rubber: () => createRubberTexture(),
};

export function getTexture(texType, color) {
  const fn = TEXTURE_REGISTRY[texType] || (() => createColorTexture(color || '#d4d4d4'));
  return { map: fn(color) };
}

// ══════════════════════════════════════════════════════════════════════════════
//  AI MATERIAL RESOLVERS (32 Database Materials Covered)
// ══════════════════════════════════════════════════════════════════════════════

// 1. Walling Material Resolver (6 database materials mapped)
export function getWallMaterial(selectionId, palette, mode) {
  const id = String(selectionId || '').toLowerCase();
  
  // CSEB Block
  if (id.includes('cseb') || id.includes('stabilized earth') || id === '8' || id === '242') {
    return { texType: 'cseb', color: '#b3825f', roughness: 0.9, metalness: 0.0 };
  }
  // Clay Brick (Wire-Cut or Hollow)
  if (id.includes('clay brick') || id.includes('clay block') || id.includes('wire-cut') || id === '7' || id === '215' || id === '251') {
    return { texType: 'brick', color: '#c87941', roughness: 0.8, metalness: 0.05 };
  }
  // AAC Block (Autoclaved Aerated Concrete)
  if (id.includes('aac') || id.includes('aerated') || id === '224') {
    return { texType: 'concrete_roof', color: '#cbd5e1', roughness: 0.9, metalness: 0.0 };
  }
  // High-Density Cement Block
  if (id.includes('cement block') || id.includes('concrete block') || id === '233') {
    return { texType: 'concrete_roof', color: '#94a3b8', roughness: 0.85, metalness: 0.05 };
  }
  // Fly-Ash Composite Block
  if (id.includes('fly-ash') || id.includes('composite block') || id === '260') {
    return { texType: 'concrete_roof', color: '#78716c', roughness: 0.85, metalness: 0.05 };
  }

  // Default fallback
  return { texType: 'concrete_roof', color: palette?.wall || '#d4d4d4', roughness: 0.8, metalness: 0.05 };
}

// 2. Roofing Material Resolver (8 database materials mapped)
export function getRoofMaterial(selectionId, palette, mode) {
  const id = String(selectionId || '').toLowerCase();

  // Green Roof System
  if (id.includes('green') || id.includes('vegetation') || id === '317') {
    return { texType: 'grass', color: '#1b4332', roughness: 0.9, metalness: 0.0 };
  }
  // Portuguese Clay Tile
  if (id.includes('tile') || id.includes('portuguese') || id.includes('terracotta') || id === '1' || id === '281') {
    return { texType: 'brick', color: '#b22222', roughness: 0.8, metalness: 0.05 };
  }
  // Marine-Grade Aluminium or Zinc-Aluminium Corrugated
  if (id.includes('aluminium') || id.includes('zinc') || id.includes('corrugated') || id === '272' || id === '308') {
    return { texType: 'concrete_roof', color: '#94a3b8', roughness: 0.25, metalness: 0.8 };
  }
  // Insulated Sandwich Roof Panel
  if (id.includes('sandwich') || id.includes('pu core') || id === '290') {
    return { texType: 'concrete_roof', color: '#475569', roughness: 0.5, metalness: 0.5 };
  }
  // Standard Cement Tile
  if (id.includes('cement tile') || id.includes('concrete interlocking') || id === '2' || id === '299') {
    return { texType: 'brick', color: '#64748b', roughness: 0.85, metalness: 0.05 };
  }
  // Polycarbonate Translucent Roofing
  if (id.includes('polycarbonate') || id.includes('translucent') || id === '326') {
    return { texType: 'concrete_roof', color: '#e2e8f0', roughness: 0.1, metalness: 0.1 };
  }
  // Recycled Rubber Flat Roof Membrane
  if (id.includes('recycled rubber') || id.includes('membrane') || id === '335') {
    return { texType: 'rubber', color: '#111827', roughness: 0.9, metalness: 0.0 };
  }

  // Default fallback
  return { texType: 'concrete_roof', color: palette?.roof || '#4a5568', roughness: 0.75, metalness: 0.05 };
}

// 3. Flooring Material Resolver (6 database materials mapped)
export function getFloorMaterial(selectionId, mode) {
  const id = String(selectionId || '').toLowerCase();

  // Rubber Flooring
  if (id.includes('rubber') || id === '506') {
    return { texType: 'rubber', color: '#1e1e1f', roughness: 0.9, metalness: 0.05 };
  }
  // Timber Strip Flooring
  if (id.includes('timber') || id.includes('wood') || id.includes('hardwood') || id === '497') {
    return { texType: 'timber', color: '#8b5a2b', roughness: 0.7, metalness: 0.0 };
  }
  // Polished Terrazzo
  if (id.includes('terrazzo') || id.includes('marble') || id === '470') {
    return { texType: 'paving', color: '#e2e8f0', roughness: 0.15, metalness: 0.1 };
  }
  // Porcelain GVT Slab
  if (id.includes('porcelain') || id.includes('vitrified') || id === '479') {
    return { texType: 'paving', color: '#cbd5e1', roughness: 0.1, metalness: 0.1 };
  }
  // Standard Ceramic Floor Tile
  if (id.includes('ceramic') || id.includes('tile') || id === '15' || id === '488') {
    return { texType: 'paving', color: '#cbd5e1', roughness: 0.4, metalness: 0.05 };
  }
  // Micro-Cement Screed
  if (id.includes('micro-cement') || id.includes('screed') || id === '515') {
    return { texType: 'concrete_roof', color: '#94a3b8', roughness: 0.6, metalness: 0.05 };
  }

  // Default concrete slab
  return { texType: 'concrete_roof', color: '#94a3b8', roughness: 0.7, metalness: 0.05 };
}

// 4. Doors Material Resolver (7 database materials mapped)
export function getDoorMaterial(selectionId) {
  const id = String(selectionId || '').toLowerCase();

  // Solid Teak Timber
  if (id.includes('teak') || id.includes('solid teak') || id === '17' || id === '404') {
    return { texType: 'timber', color: '#8b5a2b', roughness: 0.6, metalness: 0.02 };
  }
  // Aluminium Profile Glass Door
  if (id.includes('aluminium') || id.includes('metal') || id.includes('heavy-duty') || id === '413') {
    return { texType: 'wood', color: '#b0b5bc', roughness: 0.25, metalness: 0.85 };
  }
  // Fiberglass FRP
  if (id.includes('fiberglass') || id.includes('frp') || id === '422') {
    return { texType: 'wood', color: '#64748b', roughness: 0.5, metalness: 0.1 };
  }
  // Standard Hollow-Core Flush
  if (id.includes('hollow-core') || id.includes('flush') || id === '18' || id === '431') {
    return { texType: 'wood', color: '#a1a1aa', roughness: 0.8, metalness: 0.0 };
  }
  // Steel Security Door
  if (id.includes('security') || id.includes('steel') || id === '19' || id === '440') {
    return { texType: 'wood', color: '#334155', roughness: 0.4, metalness: 0.75 };
  }
  // Timber Louvre Door
  if (id.includes('louvre') || id === '449') {
    return { texType: 'timber', color: '#7c2d12', roughness: 0.7, metalness: 0.0 };
  }
  // uPVC Sliding Door
  if (id.includes('upvc') || id === '20' || id === '458') {
    return { texType: 'wood', color: '#f8fafc', roughness: 0.3, metalness: 0.1 };
  }

  return { texType: 'wood', color: '#8b5a2b', roughness: 0.6, metalness: 0.02 };
}

// 5. Windows Frame Resolver (6 database materials mapped)
export function getWindowFrameMaterial(selectionId) {
  const id = String(selectionId || '').toLowerCase();

  // uPVC Multi-Chamber (White)
  if (id.includes('upvc') || id.includes('plastic') || id === '21' || id === '348') {
    return { texType: 'concrete_roof', color: '#ffffff', roughness: 0.3, metalness: 0.1 };
  }
  // Casement Aluminium or Sliding Aluminium or Fixed Glass Panel (Metallic Silver)
  if (id.includes('aluminium') || id.includes('aluminum') || id.includes('metal') || id.includes('sliding') || id === '22' || id === '356' || id === '383' || id === '392') {
    return { texType: 'concrete_roof', color: '#b0b5bc', roughness: 0.25, metalness: 0.9 };
  }
  // Timber Louvre Window (Brown)
  if (id.includes('timber') || id.includes('wood') || id.includes('teak') || id === '23' || id === '365') {
    return { texType: 'timber', color: '#8b5a2b', roughness: 0.7, metalness: 0.02 };
  }
  // Commercial Double-Glazed Unit Frame (Dark slate)
  if (id.includes('double-glazed') || id.includes('dgu') || id === '374') {
    return { texType: 'concrete_roof', color: '#1e293b', roughness: 0.3, metalness: 0.8 };
  }

  return { texType: 'concrete_roof', color: '#b0b5bc', roughness: 0.3, metalness: 0.7 };
}

export const TEXTURE_TYPES = Object.keys(TEXTURE_REGISTRY);
