"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Typography, Steps, Button, Descriptions, message } from "antd";
import {
  MessageOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { MOCK_ORDERS, ORDER_STATUS_CONFIG, ORDER_STEPS } from "@/lib/orders-mock-data";
import type { CoordinatorOrder, OrderStatus } from "@/lib/orders-mock-data";

const { Text, Title } = Typography;

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " \u20BD";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU");
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const selected = orders.find(o => o.id === selectedId) ?? null;

  const handleNextStep = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const currentIdx = ORDER_STEPS.findIndex(s => s.status === order.status);
    if (currentIdx < 0 || currentIdx >= ORDER_STEPS.length - 1) return;
    const nextStatus = ORDER_STEPS[currentIdx + 1].status;
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o
    ));
    messageApi.success(`Статус обновлён: ${ORDER_STATUS_CONFIG[nextStatus].label}`);
  };

  const handleDispute = (orderId: string) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: "dispute" as OrderStatus, updatedAt: new Date().toISOString() } : o
    ));
    messageApi.warning("Спор открыт");
  };

  const currentStep = selected
    ? ORDER_STEPS.findIndex(s => s.status === selected.status)
    : -1;

  return (
    <PageContainer title="Управление заказами" subTitle="Сопровождение и контроль выигранных лотов">
      {contextHolder}
      <div style={{ display: "flex", gap: 24 }}>
        {/* Left: list */}
        <div style={{ width: 380, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {orders.map(order => {
              const cfg = ORDER_STATUS_CONFIG[order.status];
              const days = daysUntil(order.deadline);
              return (
                <Card
                  key={order.id}
                  size="small"
                  hoverable
                  onClick={() => setSelectedId(order.id)}
                  style={{
                    borderLeft: selectedId === order.id ? "4px solid #2563eb" : days < 0 && order.status !== "completed" ? "4px solid #f5222d" : "4px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12, color: "#8c8c8c" }}>{order.id}</Text>
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                  </div>
                  <Text strong style={{ fontSize: 13, display: "block" }}>{order.lotTitle}</Text>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{order.supplierCompany}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>{formatPrice(order.finalPrice)}</Text>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">{selected.id} | {selected.lotNumber}</Text>
                <Title level={4} style={{ margin: "4px 0 8px" }}>{selected.lotTitle}</Title>
                <Tag color={ORDER_STATUS_CONFIG[selected.status].color}>
                  {ORDER_STATUS_CONFIG[selected.status].label}
                </Tag>
              </div>

              {/* Трекер */}
              {selected.status === "dispute" ? (
                <Card size="small" style={{ marginBottom: 20, borderColor: "#f5222d" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <WarningOutlined style={{ color: "#f5222d", fontSize: 20 }} />
                    <Text strong style={{ color: "#f5222d" }}>Заказ на рассмотрении — открыт спор</Text>
                  </div>
                </Card>
              ) : (
                <Steps
                  current={currentStep}
                  size="small"
                  style={{ marginBottom: 24 }}
                  items={ORDER_STEPS.map(s => ({ title: s.label }))}
                />
              )}

              <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Поставщик">{selected.supplierName}</Descriptions.Item>
                <Descriptions.Item label="Компания поставщика">{selected.supplierCompany}</Descriptions.Item>
                <Descriptions.Item label="Заказчик">{selected.customerName}</Descriptions.Item>
                <Descriptions.Item label="Компания заказчика">{selected.customerCompany}</Descriptions.Item>
                <Descriptions.Item label="Итоговая цена">{formatPrice(selected.finalPrice)}</Descriptions.Item>
                <Descriptions.Item label="Количество">{selected.quantity} {selected.unit}</Descriptions.Item>
                <Descriptions.Item label="Дедлайн">{formatDate(selected.deadline)}</Descriptions.Item>
                <Descriptions.Item label="Создан">{formatDate(selected.createdAt)}</Descriptions.Item>
              </Descriptions>

              {selected.notes && (
                <Card size="small" title="Заметки" style={{ marginBottom: 20 }}>
                  <Text>{selected.notes}</Text>
                </Card>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {selected.status !== "completed" && selected.status !== "dispute" && currentStep < ORDER_STEPS.length - 1 && (
                  <Button type="primary" onClick={() => handleNextStep(selected.id)}>
                    Перевести в «{ORDER_STEPS[currentStep + 1]?.label}»
                  </Button>
                )}
                {selected.status !== "completed" && selected.status !== "dispute" && (
                  <Button danger onClick={() => handleDispute(selected.id)}>
                    Открыть спор
                  </Button>
                )}
                <Button icon={<MessageOutlined />}>
                  Написать сообщение
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
                Выберите заказ для просмотра
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
