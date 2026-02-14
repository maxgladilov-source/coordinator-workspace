"use client";

import { useState } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Typography, Descriptions, Timeline } from "antd";
import {
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { MOCK_DISPUTES, DISPUTE_STATUS_CONFIG, DISPUTE_TYPE_CONFIG, DISPUTE_PRIORITY_CONFIG } from "@/lib/disputes-mock-data";
import type { Dispute } from "@/lib/disputes-mock-data";

const { Text, Title } = Typography;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU");
}

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " \u20BD";
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const ROLE_COLOR: Record<string, string> = {
  buyer: "blue",
  coordinator: "geekblue",
  supplier: "green",
  system: "default",
};

export default function DisputesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MOCK_DISPUTES.find(d => d.id === selectedId) ?? null;

  return (
    <PageContainer title="Споры" subTitle="Разрешение конфликтных ситуаций по заказам">
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ width: 380, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_DISPUTES.map(d => {
              const sCfg = DISPUTE_STATUS_CONFIG[d.status];
              const pCfg = DISPUTE_PRIORITY_CONFIG[d.priority];
              const deadlineDays = daysUntil(d.resolutionDeadline);
              return (
                <Card
                  key={d.id}
                  size="small"
                  hoverable
                  onClick={() => setSelectedId(d.id)}
                  style={{
                    borderLeft: selectedId === d.id ? "4px solid #2563eb" : `4px solid ${pCfg.color}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12, color: "#8c8c8c" }}>{d.id}</Text>
                    <Tag color={sCfg.color}>{sCfg.label}</Tag>
                    <Tag style={{ color: pCfg.color, borderColor: pCfg.color }}>{pCfg.label}</Tag>
                  </div>
                  <Text strong style={{ fontSize: 13, display: "block" }}>{d.title}</Text>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{d.orderId}</Text>
                    <Text style={{ fontSize: 12, color: deadlineDays <= 3 ? "#f5222d" : "#8c8c8c" }}>
                      {deadlineDays > 0 ? `${deadlineDays} дн.` : "Просрочен"}
                    </Text>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">{selected.id} | Заказ {selected.orderId}</Text>
                <Title level={4} style={{ margin: "4px 0 8px" }}>{selected.title}</Title>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag color={DISPUTE_STATUS_CONFIG[selected.status].color}>{DISPUTE_STATUS_CONFIG[selected.status].label}</Tag>
                  <Tag style={{ color: DISPUTE_PRIORITY_CONFIG[selected.priority].color, borderColor: DISPUTE_PRIORITY_CONFIG[selected.priority].color }}>{DISPUTE_PRIORITY_CONFIG[selected.priority].label}</Tag>
                  <Tag style={{ color: DISPUTE_TYPE_CONFIG[selected.type].color, borderColor: DISPUTE_TYPE_CONFIG[selected.type].color }}>{DISPUTE_TYPE_CONFIG[selected.type].label}</Tag>
                </div>
              </div>

              <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Заказ">{selected.orderTitle}</Descriptions.Item>
                <Descriptions.Item label="Сумма спора">{formatPrice(selected.amountInDispute)}</Descriptions.Item>
                <Descriptions.Item label="Подал">{selected.filedBy}</Descriptions.Item>
                <Descriptions.Item label="Дата подачи">{formatDate(selected.filedAt)}</Descriptions.Item>
                <Descriptions.Item label="Дедлайн решения">{formatDate(selected.resolutionDeadline)}</Descriptions.Item>
                <Descriptions.Item label="Доказательств">{selected.evidenceCount}</Descriptions.Item>
                <Descriptions.Item label="Описание" span={2}>{selected.description}</Descriptions.Item>
              </Descriptions>

              <Card size="small" title="Переписка по спору">
                <Timeline
                  items={selected.messages.map(m => ({
                    color: m.role === "coordinator" ? "blue" : m.role === "system" ? "gray" : m.role === "buyer" ? "blue" : "green",
                    children: (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <Tag color={ROLE_COLOR[m.role]} style={{ fontSize: 11 }}>{m.author}</Tag>
                          <Text type="secondary" style={{ fontSize: 11 }}>{formatDate(m.timestamp)}</Text>
                        </div>
                        <Text style={{ fontSize: 13 }}>{m.text}</Text>
                      </div>
                    ),
                  }))}
                />
              </Card>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
                <ExclamationCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <br />
                Выберите спор для просмотра
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
