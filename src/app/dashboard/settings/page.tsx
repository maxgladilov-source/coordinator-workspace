"use client";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";

export default function SettingsPage() {
  return (
    <PageContainer title="Настройки" subTitle="Параметры рабочего пространства">
      <Card>
        <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
          <SettingOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <br />
          <Typography.Text type="secondary">Раздел в разработке</Typography.Text>
        </div>
      </Card>
    </PageContainer>
  );
}
