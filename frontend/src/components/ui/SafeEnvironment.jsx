"use client";
import React, { Component, Suspense } from 'react';
import { Environment } from '@react-three/drei';

/**
 * EnvironmentErrorBoundary – Catches remote HDRI fetch failures (e.g. offline,
 * blocked CDN, or potsdamer_platz_1k.hdr fetch errors) and gracefully falls back
 * to standard Three.js lighting without crashing the 3D Canvas.
 */
class EnvironmentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[SafeEnvironment] HDRI map failed to fetch/load, falling back to standard lights:', error?.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <group>
          <ambientLight intensity={0.7} />
          <hemisphereLight intensity={0.4} skyColor="#ffffff" groundColor="#8d99ae" />
        </group>
      );
    }
    return this.props.children;
  }
}

export default function SafeEnvironment(props) {
  return (
    <EnvironmentErrorBoundary>
      <Suspense fallback={
        <group>
          <ambientLight intensity={0.5} />
        </group>
      }>
        <Environment {...props} />
      </Suspense>
    </EnvironmentErrorBoundary>
  );
}
