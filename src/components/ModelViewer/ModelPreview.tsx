"use client";

import React, { useState, useEffect, useCallback, Component } from "react";
import dynamic from "next/dynamic";
import { Typography, Button } from "antd";
import {
  BorderOutlined,
  AppstoreOutlined,
  GatewayOutlined,
  DownOutlined,
  UpOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { SceneMetrics } from "./SceneContent";
import LoadingIndicator from "./LoadingIndicator";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => <LoadingIndicator />,
});

const { Text } = Typography;

const GRID_PRESETS = [
  { label: "10 мм", cellSize: 1, sectionSize: 10 },
  { label: "100 мм", cellSize: 10, sectionSize: 100 },
  { label: "1000 мм", cellSize: 100, sectionSize: 1000 },
] as const;

// --- Error Boundary for 3D viewer crashes ---

interface ErrorBoundaryProps {
  onRetry: () => void;
  dark: boolean;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            height: 350,
            borderRadius: 8,
            border: `1px solid ${this.props.dark ? "#333" : "#d9d9d9"}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            background: this.props.dark ? "#1a1a1a" : "#fafafa",
          }}
        >
          <WarningOutlined style={{ fontSize: 28, opacity: 0.4 }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Не удалось загрузить 3D-просмотр
          </Text>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry();
            }}
          >
            Повторить
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main Component ---

interface ModelPreviewProps {
  modelUrl: string;
}

export default function ModelPreview({ modelUrl }: ModelPreviewProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showBounds, setShowBounds] = useState(false);
  const [dark, setDark] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [gridPresetIdx, setGridPresetIdx] = useState(0);
  const [sceneMetrics, setSceneMetrics] = useState<SceneMetrics | null>(null);

  const gridPreset = GRID_PRESETS[gridPresetIdx];

  const handleSceneMetrics = useCallback((m: SceneMetrics) => {
    setSceneMetrics(m);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    setDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 4,
    border: `1px solid ${active ? "#1677ff" : dark ? "#424242" : "#d9d9d9"}`,
    background: active
      ? dark
        ? "rgba(22,119,255,0.15)"
        : "rgba(22,119,255,0.06)"
      : "transparent",
    color: active ? "#1677ff" : dark ? "#ffffffa6" : "#595959",
    cursor: "pointer",
    fontSize: 12,
    lineHeight: "22px",
    userSelect: "none" as const,
    transition: "all 0.2s",
  });

  return (
    <div
      style={{
        padding: "12px 0",
        borderTop: "1px solid var(--ant-color-border, #f0f0f0)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: collapsed ? 0 : 8,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <Text strong style={{ fontSize: 13 }}>
          3D-просмотр
        </Text>
        {collapsed ? (
          <DownOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
        ) : (
          <UpOutlined style={{ fontSize: 11, color: "#8c8c8c" }} />
        )}
      </div>

      {!collapsed && (
        <>
          {/* Viewer with Error Boundary */}
          <ModelErrorBoundary
            key={retryKey}
            dark={dark}
            onRetry={() => setRetryKey((k) => k + 1)}
          >
            <ModelViewer
              modelUrl={modelUrl}
              height="350px"
              wireframe={wireframe}
              showGrid={showGrid}
              showBounds={showBounds}
              dark={dark}
              cellSize={gridPreset.cellSize}
              sectionSize={gridPreset.sectionSize}
              onSceneMetrics={handleSceneMetrics}
            />
          </ModelErrorBoundary>

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={toggleBtnStyle(wireframe)}
              onClick={() => setWireframe(!wireframe)}
            >
              <GatewayOutlined style={{ fontSize: 13 }} />
              Каркас
            </span>
            <span
              style={toggleBtnStyle(showGrid)}
              onClick={() => setShowGrid(!showGrid)}
            >
              <AppstoreOutlined style={{ fontSize: 13 }} />
              Сетка
            </span>
            <span
              style={toggleBtnStyle(showBounds)}
              onClick={() => setShowBounds(!showBounds)}
            >
              <BorderOutlined style={{ fontSize: 13 }} />
              Габариты
            </span>

            {showGrid && (
              <>
                <span style={{ width: 1, height: 16, background: dark ? "#424242" : "#d9d9d9", margin: "0 2px" }} />
                <Text type="secondary" style={{ fontSize: 11, marginRight: 2 }}>Сетка:</Text>
                {GRID_PRESETS.map((preset, i) => (
                  <span
                    key={preset.label}
                    style={toggleBtnStyle(gridPresetIdx === i)}
                    onClick={() => setGridPresetIdx(i)}
                  >
                    {preset.label}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Grid scale info */}
          {showGrid && sceneMetrics && (
            <div
              style={{
                marginTop: 6,
                padding: "4px 8px",
                borderRadius: 4,
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${dark ? "#303030" : "#f0f0f0"}`,
                fontSize: 11,
                color: dark ? "#ffffffa6" : "#8c8c8c",
                display: "flex",
                gap: 12,
              }}
            >
              <span>Ячейка: <strong style={{ color: dark ? "#ffffffd9" : "#595959" }}>{gridPreset.cellSize} мм</strong></span>
              <span>Секция: <strong style={{ color: "#9d4b4b" }}>{gridPreset.sectionSize} мм</strong></span>
              <span>Макс. размер: <strong style={{ color: dark ? "#ffffffd9" : "#595959" }}>{sceneMetrics.maxDim.toFixed(1)} мм</strong></span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
