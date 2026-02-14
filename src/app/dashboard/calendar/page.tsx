"use client";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

export default function CalendarPage() {
  return (
    <PageContainer title="Календарь" subTitle="Дедлайны лотов и заказов">
      <Card>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <br />
          <Typography.Text type="secondary">Раздел в разработке</Typography.Text>
        </div>
      </Card>
    </PageContainer>
  );
}
