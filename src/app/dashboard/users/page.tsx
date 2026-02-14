"use client";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";

export default function UsersPage() {
  return (
    <PageContainer title="Пользователи" subTitle="Заказчики и поставщики">
      <Card>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <br />
          <Typography.Text type="secondary">Раздел в разработке</Typography.Text>
        </div>
      </Card>
    </PageContainer>
  );
}
