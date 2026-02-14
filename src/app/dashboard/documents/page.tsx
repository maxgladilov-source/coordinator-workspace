"use client";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

export default function DocumentsPage() {
  return (
    <PageContainer title="Документы" subTitle="Документация по лотам и заказам">
      <Card>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <br />
          <Typography.Text type="secondary">Раздел в разработке</Typography.Text>
        </div>
      </Card>
    </PageContainer>
  );
}
