"use client";

import { Spin } from "antd";

export default function LoadingIndicator() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.05)",
        zIndex: 10,
      }}
    >
      <Spin size="large" tip="Загрузка 3D-модели...">
        <div style={{ width: 80, height: 80 }} />
      </Spin>
    </div>
  );
}
