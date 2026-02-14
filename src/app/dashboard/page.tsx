"use client";

import { useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Typography, Statistic, Tag, Progress } from "antd";
import {
  FileSearchOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  StopOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { MOCK_LOTS, LOT_STATUS_CONFIG } from "@/lib/lots-mock-data";
import { MOCK_ORDERS, ORDER_STATUS_CONFIG } from "@/lib/orders-mock-data";
import { MOCK_CONVERSATIONS } from "@/lib/messages-mock-data";
import { MOCK_DISPUTES } from "@/lib/disputes-mock-data";

const { Text } = Typography;

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " \u20BD";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU");
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
  const pendingLots = useMemo(() => MOCK_LOTS.filter(l => l.status === "pending_review"), []);
  const clarificationLots = useMemo(() => MOCK_LOTS.filter(l => l.status === "clarification"), []);
  const activeOrders = useMemo(() => MOCK_ORDERS.filter(o => o.status !== "completed"), []);
  const disputeOrders = useMemo(() => MOCK_ORDERS.filter(o => o.status === "dispute"), []);
  const unreadMessages = useMemo(() => MOCK_CONVERSATIONS.reduce((s, c) => s + c.unreadCount, 0), []);
  const contactViolations = useMemo(() => MOCK_LOTS.reduce((s, l) => s + l.contactViolations, 0), []);
  const activeDisputes = useMemo(() => MOCK_DISPUTES.filter(d => d.status !== "resolved" && d.status !== "closed"), []);
  const approvedLots = useMemo(() => MOCK_LOTS.filter(l => l.status === "approved" || l.status === "published"), []);

  // Требуется действие
  const actionItems = useMemo(() => {
    const items: { key: string; icon: React.ReactNode; color: string; text: string }[] = [];

    pendingLots.forEach(l => {
      items.push({
        key: `lot-review-${l.id}`,
        icon: <FileSearchOutlined />,
        color: "#1677ff",
        text: `Лот ${l.number} «${l.title}» — ожидает проверки`,
      });
    });

    MOCK_LOTS.filter(l => l.contactViolations > 0 && l.status !== "rejected").forEach(l => {
      items.push({
        key: `lot-contact-${l.id}`,
        icon: <StopOutlined />,
        color: "#f5222d",
        text: `Лот ${l.number} — обнаружена контактная информация (${l.contactViolations} нарушение)`,
      });
    });

    activeDisputes.filter(d => d.priority === "critical" || d.priority === "high").forEach(d => {
      items.push({
        key: `dispute-${d.id}`,
        icon: <AlertOutlined />,
        color: "#f5222d",
        text: `Спор ${d.id} «${d.title}» — ${d.status === "escalated" ? "эскалирован" : "требует внимания"}`,
      });
    });

    MOCK_ORDERS.forEach(o => {
      const days = daysUntil(o.deadline);
      if (days < 0 && o.status !== "completed") {
        items.push({
          key: `order-overdue-${o.id}`,
          icon: <ExclamationCircleOutlined />,
          color: "#fa541c",
          text: `Заказ ${o.id} «${o.lotTitle}» — просрочен на ${Math.abs(days)} дн.`,
        });
      }
    });

    return items;
  }, [pendingLots, activeDisputes]);

  // Воронка лотов
  const lotFunnel = useMemo(() => {
    const stages = [
      { label: "На проверке", statuses: ["pending_review"], color: "#1677ff" },
      { label: "Уточнение", statuses: ["clarification"], color: "#fa8c16" },
      { label: "Одобрен", statuses: ["approved"], color: "#52c41a" },
      { label: "Опубликован", statuses: ["published"], color: "#13c2c2" },
      { label: "Отклонён", statuses: ["rejected"], color: "#f5222d" },
    ];
    const total = MOCK_LOTS.filter(l => l.status !== "draft").length;
    return stages.map(s => {
      const count = MOCK_LOTS.filter(l => s.statuses.includes(l.status)).length;
      return { ...s, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
  }, []);

  return (
    <PageContainer
      title="Панель координатора"
      subTitle="Контроль лотов, заказов и коммуникаций"
    >
      {/* KPI */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Ожидают проверки" value={pendingLots.length} prefix={<FileSearchOutlined />} valueStyle={{ color: "#1677ff" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="На уточнении" value={clarificationLots.length} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#fa8c16" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Активных заказов" value={activeOrders.length} prefix={<ShoppingCartOutlined />} valueStyle={{ color: "#722ed1" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Открытые споры" value={disputeOrders.length + activeDisputes.length} prefix={<WarningOutlined />} valueStyle={{ color: "#f5222d" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Непрочитанные сообщения" value={unreadMessages} prefix={<MessageOutlined />} valueStyle={{ color: "#1677ff" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Нарушения контактов" value={contactViolations} prefix={<StopOutlined />} valueStyle={{ color: "#f5222d" }} />
        </Card>
        <Card size="small" style={{ flex: "1 1 200px", minWidth: 200 }} hoverable>
          <Statistic title="Одобрено / Опубликовано" value={approvedLots.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} />
        </Card>
      </div>

      {/* Требуется действие */}
      {actionItems.length > 0 && (
        <Card title={<span><WarningOutlined style={{ color: "#fa8c16", marginRight: 8 }} />Требуется действие</span>} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {actionItems.map(item => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderLeft: `4px solid ${item.color}`, backgroundColor: item.color === "#f5222d" ? "rgba(245,34,45,0.04)" : "rgba(22,119,255,0.04)", borderRadius: "0 6px 6px 0" }}>
                <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
                <Text style={{ flex: 1 }}>{item.text}</Text>
                <ArrowRightOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Воронка лотов */}
      <Card title="Воронка лотов" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lotFunnel.map(stage => (
            <div key={stage.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Text style={{ width: 140, flexShrink: 0, textAlign: "right", fontSize: 13 }}>{stage.label}</Text>
              <div style={{ flex: 1 }}>
                <Progress percent={stage.percent} strokeColor={stage.color} format={() => <span style={{ fontWeight: 600 }}>{stage.count}</span>} size="small" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Лоты на проверке */}
        <Card title="Лоты на проверке">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_LOTS.filter(l => l.status === "pending_review" || l.status === "clarification").map(lot => {
              const cfg = LOT_STATUS_CONFIG[lot.status];
              return (
                <div key={lot.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "1px solid #f0f0f0", borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 12, color: "#8c8c8c" }}>{lot.number}</Text>
                      <Tag color={cfg.color}>{cfg.label}</Tag>
                      {lot.contactViolations > 0 && <Tag color="red"><StopOutlined /> Контакт</Tag>}
                    </div>
                    <Text ellipsis style={{ display: "block", fontSize: 13 }}>{lot.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Заказчик: {lot.customerId}</Text>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right", marginLeft: 12 }}>
                    <Text style={{ fontSize: 12, color: "#8c8c8c" }}>{formatDate(lot.updatedAt)}</Text>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Активные заказы */}
        <Card title="Активные заказы">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_ORDERS.filter(o => o.status !== "completed").map(order => {
              const cfg = ORDER_STATUS_CONFIG[order.status];
              const days = daysUntil(order.deadline);
              return (
                <div key={order.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "1px solid #f0f0f0", borderRadius: 8, borderLeft: days < 0 ? "4px solid #f5222d" : days <= 5 ? "4px solid #fa8c16" : "4px solid #d9d9d9" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <Text strong style={{ fontSize: 12, color: "#8c8c8c" }}>{order.id}</Text>
                      <Tag color={cfg.color}>{cfg.label}</Tag>
                    </div>
                    <Text ellipsis style={{ display: "block", fontSize: 13 }}>{order.lotTitle}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Поставщик: {order.supplierId}</Text>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: days < 0 ? "#f5222d" : days <= 5 ? "#fa8c16" : "#595959" }}>
                      {days < 0 ? `Просрочен ${Math.abs(days)} дн.` : `${days} дн.`}
                    </Text>
                    <br />
                    <Text style={{ fontSize: 12, color: "#8c8c8c" }}>{formatPrice(order.finalPrice)}</Text>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
