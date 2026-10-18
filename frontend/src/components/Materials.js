// src/components/Materials.js

import * as THREE from 'three';
import { useMemo } from 'react';

export const useWoodMaterial = (color = '#c19a6b') => {
  return useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.0,
    });
  }, [color]);
};

export const useFabricMaterial = (color = '#e0d5c4') => {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.0,
  }), [color]);
};

export const useStoneMaterial = (color = '#8a8a8a') => {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.0,
  }), [color]);
};

export const useGlassMaterial = (color = '#ffffff', opacity = 0.3) => {
  return useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    transmission: 0.9,
    thickness: 0.1,
    roughness: 0.1,
    metalness: 0,
    transparent: true,
    opacity,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }), [color, opacity]);
};

export const useFloorMaterial = (color = '#d9c5a0') => {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.05,
  }), [color]);
};

export const useWallMaterial = (color = '#f0e5d8') => {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0,
  }), [color]);
};
