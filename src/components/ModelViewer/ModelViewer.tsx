"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import SceneContent, { type SceneMetrics } from "./SceneContent";
import LoadingIndicator from "./LoadingIndicator";

interface ModelViewerProps {
  modelUrl: string;
  height?: string;
  wireframe?: boolean;
  showGrid?: boolean;
  showBounds?: boolean;
  backgroundColor?: string;
  dark?: boolean;
  cellSize?: number;
  sectionSize?: number;
  onSceneMetrics?: (m: SceneMetrics) => void;
}

export default function ModelViewer({
  modelUrl,
  height = "500px",
  wireframe = false,
  showGrid = true,
  showBounds = false,
  backgroundColor = "#2a2a2a",
  dark = false,
  cellSize,
  sectionSize,
  onSceneMetrics,
}: ModelViewerProps) {
  const bg = dark ? "#1a1a1a" : backgroundColor;

  const handleSceneMetrics = useCallback((m: SceneMetrics) => {
    onSceneMetrics?.(m);
  }, [onSceneMetrics]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${dark ? "#333" : "#d9d9d9"}`,
      }}
    >
      <Suspense fallback={<LoadingIndicator />}>
        <Canvas
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          camera={{ fov: 45, near: 0.01, far: 100000, position: [3, 2, 5] }}
          style={{ background: bg }}
        >
          <SceneContent
            modelUrl={modelUrl}
            wireframe={wireframe}
            showGrid={showGrid}
            showBounds={showBounds}
            backgroundColor={bg}
            cellSize={cellSize}
            sectionSize={sectionSize}
            onSceneMetrics={handleSceneMetrics}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
