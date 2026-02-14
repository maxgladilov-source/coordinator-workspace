"use client";

import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Grid, Html } from "@react-three/drei";
import * as THREE from "three";

export interface SceneMetrics {
  maxDim: number;
  cellSize: number;
  sectionSize: number;
}

interface SceneContentProps {
  modelUrl: string;
  wireframe: boolean;
  showGrid: boolean;
  showBounds: boolean;
  backgroundColor?: string;
  cellSize?: number;
  sectionSize?: number;
  onSceneMetrics?: (m: SceneMetrics) => void;
}

interface ModelMetrics {
  center: THREE.Vector3;
  size: THREE.Vector3;
  min: THREE.Vector3;
  max: THREE.Vector3;
  maxDim: number;
  bottomY: number;
}

function Model({
  url,
  wireframe,
  onMetrics,
}: {
  url: string;
  wireframe: boolean;
  onMetrics: (m: ModelMetrics) => void;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const onMetricsRef = useRef(onMetrics);
  onMetricsRef.current = onMetrics;

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!child.material) {
          child.material = new THREE.MeshStandardMaterial({
            color: "#b0b0b0",
            metalness: 0.3,
            roughness: 0.6,
          });
        }
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((mat) => {
          if (
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial
          ) {
            mat.wireframe = wireframe;
            const lum = mat.color.r * 0.299 + mat.color.g * 0.587 + mat.color.b * 0.114;
            if (lum > 0.9 && mat.metalness < 0.1) {
              mat.color.set("#b0b0b0");
              mat.metalness = 0.3;
              mat.roughness = 0.6;
            }
          }
        });
      }
    });
  }, [clonedScene, wireframe]);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov =
      camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
    const dist = maxDim / (2 * Math.tan((fov * Math.PI) / 360));

    camera.near = maxDim * 0.001;
    camera.far = maxDim * 100;

    camera.position.set(
      center.x + dist * 0.8,
      center.y + dist * 0.5,
      center.z + dist * 1.2
    );
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    onMetricsRef.current({
      center,
      size,
      min: box.min.clone(),
      max: box.max.clone(),
      maxDim,
      bottomY: box.min.y,
    });
  }, [clonedScene, camera]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

const dimLabelStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.7)",
  color: "#fff",
  padding: "2px 6px",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  whiteSpace: "nowrap",
  pointerEvents: "none",
  userSelect: "none",
};

function BoundingBoxHelper({ metrics }: { metrics: ModelMetrics }) {
  const { min, max, size, center } = metrics;

  const boxGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    return new THREE.EdgesGeometry(geo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.x, size.y, size.z]);

  const formatDim = (v: number) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)} m`;
    return `${v.toFixed(1)} mm`;
  };

  return (
    <group>
      <lineSegments geometry={boxGeo} position={[center.x, center.y, center.z]}>
        <lineBasicMaterial color="#ff6600" linewidth={1} transparent opacity={0.8} />
      </lineSegments>

      <Html position={[center.x, min.y, max.z]} style={dimLabelStyle} center>
        {formatDim(size.x)} <span style={{ opacity: 0.6 }}>X</span>
      </Html>

      <Html position={[max.x, center.y, max.z]} style={dimLabelStyle} center>
        {formatDim(size.y)} <span style={{ opacity: 0.6 }}>Y</span>
      </Html>

      <Html position={[max.x, min.y, center.z]} style={dimLabelStyle} center>
        {formatDim(size.z)} <span style={{ opacity: 0.6 }}>Z</span>
      </Html>
    </group>
  );
}

export default function SceneContent({
  modelUrl,
  wireframe,
  showGrid,
  showBounds,
  backgroundColor,
  cellSize: cellSizeProp,
  sectionSize: sectionSizeProp,
  onSceneMetrics,
}: SceneContentProps) {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const onSceneMetricsRef = useRef(onSceneMetrics);
  onSceneMetricsRef.current = onSceneMetrics;

  const handleMetrics = useCallback((m: ModelMetrics) => {
    setMetrics(m);
  }, []);

  const bgColor = useMemo(
    () => (backgroundColor ? new THREE.Color(backgroundColor) : null),
    [backgroundColor]
  );
  useFrame(({ scene }) => {
    if (bgColor && (!scene.background || !(scene.background as THREE.Color).equals?.(bgColor))) {
      scene.background = bgColor;
    }
  });

  const dim = metrics?.maxDim ?? 1;
  const cellSize = cellSizeProp ?? 1;
  const sectionSize = sectionSizeProp ?? 10;

  useEffect(() => {
    if (metrics) {
      onSceneMetricsRef.current?.({ maxDim: dim, cellSize, sectionSize });
    }
  }, [metrics, dim, cellSize, sectionSize]);
  const gridY = metrics?.bottomY ?? -1.5;
  const fadeDistance = Math.max(dim * 4, 200);
  const lightDist = dim * 2;

  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#ffffff", "#444444", 0.5]} />
      <directionalLight
        position={[lightDist, lightDist * 1.6, lightDist]}
        intensity={1.2}
        castShadow
      />
      <directionalLight
        position={[-lightDist * 0.6, lightDist * 0.8, -lightDist]}
        intensity={0.7}
      />
      <directionalLight
        position={[0, -lightDist, lightDist * 0.5]}
        intensity={0.3}
      />

      <Model url={modelUrl} wireframe={wireframe} onMetrics={handleMetrics} />

      {showBounds && metrics && <BoundingBoxHelper metrics={metrics} />}

      {showGrid && (
        <Grid
          args={[20, 20]}
          position={[metrics?.center.x ?? 0, gridY, metrics?.center.z ?? 0]}
          cellSize={cellSize}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={sectionSize}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={fadeDistance}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        target={metrics?.center ? [metrics.center.x, metrics.center.y, metrics.center.z] : [0, 0, 0]}
        minDistance={dim * 0.1}
        maxDistance={dim * 20}
      />
    </>
  );
}
