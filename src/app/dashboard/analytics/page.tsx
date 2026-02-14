"use client";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

export default function AnalyticsPage() {
  return (
    <PageContainer title="Аналитика" subTitle="Показатели эффективности координации">
      <Card>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <br />
          <Typography.Text type="secondary">Раздел в разработке</Typography.Text>
        </div>
      </Card>
    </PageContainer>
  );
}
