"use client";

import dynamic from "next/dynamic";
import LoadingIndicator from "./LoadingIndicator";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => <LoadingIndicator />,
});

export default ModelViewer;
