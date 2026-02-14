"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import {
  Card,
  Tag,
  Typography,
  Empty,
  Descriptions,
  Input,
  Select,
  Statistic,
  Steps,
  Button,
  message,
  theme,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  WarningOutlined,
  MessageOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  MOCK_ORDERS,
  ORDER_STATUS_CONFIG,
  ORDER_STEPS,
  type CoordinatorOrder,
  type OrderStatus,
} from "@/lib/orders-mock-data";
import { usePermissions } from "@/contexts/RoleContext";
import "./orders.css";

const { Text, Title, Paragraph } = Typography;

// --- Helpers ---

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

function getDaysLeft(deadline: string): { text: string; days: number; urgent: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diff = dl.getTime() - now.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: `${Math.abs(days)} дн. просрочено`, days, urgent: true };
  if (days === 0) return { text: "Сегодня", days, urgent: true };
  return { text: `${days} дн.`, days, urgent: days <= 3 };
}

// --- Order Card ---

function OrderCard({
  order,
  selected,
  onClick,
}: {
  order: CoordinatorOrder;
  selected: boolean;
  onClick: () => void;
}) {
  const statusCfg = ORDER_STATUS_CONFIG[order.status];
  const deadline = getDaysLeft(order.deadline);

  let stateClass = "";
  if (order.status === "dispute") stateClass = " order-card-dispute";
  else if (order.status === "completed") stateClass = " order-card-completed";

  return (
    <Card
      size="small"
      className={`order-card${selected ? " order-card-selected" : ""}${stateClass}`}
      onClick={onClick}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {/* Left: main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{order.id}</Text>
              <div>
                <Text strong style={{ fontSize: 14 }}>{order.lotTitle}</Text>
              </div>
            </div>
            <Tag color={statusCfg.color} style={{ marginLeft: 8, flexShrink: 0 }}>
              {statusCfg.label}
            </Tag>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <Tag style={{ margin: 0 }}>{order.lotNumber}</Tag>
            {order.status === "dispute" && (
              <Tag color="red" icon={<WarningOutlined />} style={{ margin: 0 }}>Спор</Tag>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{order.supplierCompany}</Text>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(order.deadline)}</Text>
              <Tag color={deadline.urgent ? "red" : "blue"} style={{ margin: 0, fontSize: 11 }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{deadline.text}
              </Tag>
            </div>
          </div>
        </div>

        {/* Right: price + qty badge */}
        <div
          className="order-card-badge"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            minWidth: 64,
            padding: "8px 10px",
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>
            {formatCurrency(order.finalPrice)}
          </span>
          <span style={{ fontSize: 13, color: "#1677ff", marginTop: 4 }}>
            {order.quantity.toLocaleString("ru-RU")} {order.unit}
          </span>
        </div>
      </div>
    </Card>
  );
}

// --- Detail Panel ---

function OrderDetailPanel({
  order,
  canChangeStatus,
  canOpenDispute,
  canSendMessage,
  onNextStep,
  onDispute,
}: {
  order: CoordinatorOrder;
  canChangeStatus: boolean;
  canOpenDispute: boolean;
  canSendMessage: boolean;
  onNextStep: (orderId: string) => void;
  onDispute: (orderId: string) => void;
}) {
  const { token } = theme.useToken();
  const statusCfg = ORDER_STATUS_CONFIG[order.status];
  const deadline = getDaysLeft(order.deadline);
  const currentStep = ORDER_STEPS.findIndex(s => s.status === order.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          <Tag>{order.lotNumber}</Tag>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{order.id}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>·</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>Создан {formatDate(order.createdAt)}</Text>
        </div>
        <Title level={5} style={{ margin: 0 }}>{order.lotTitle}</Title>
      </div>

      {/* Трекер */}
      {order.status === "dispute" ? (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ padding: "12px 16px", background: "#fff2f0", borderRadius: 8, border: "1px solid #ffccc7", display: "flex", alignItems: "center", gap: 8 }}>
            <WarningOutlined style={{ color: "#f5222d", fontSize: 20 }} />
            <Text strong style={{ color: "#f5222d" }}>Заказ на рассмотрении — открыт спор</Text>
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Steps
            current={currentStep}
            size="small"
            items={ORDER_STEPS.map(s => ({ title: s.label }))}
          />
        </div>
      )}

      {/* Поставщик */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Поставщик</Text>
        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item label="Контактное лицо">{order.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Компания">{order.supplierCompany}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* Заказчик */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Заказчик</Text>
        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item label="Контактное лицо">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="Компания">{order.customerCompany}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* Детали заказа */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Детали заказа</Text>
        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item label="Итоговая цена">
            <Text strong style={{ color: "#f59e0b" }}>{formatCurrency(order.finalPrice)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Количество">
            {order.quantity.toLocaleString("ru-RU")} {order.unit}
          </Descriptions.Item>
          {order.quantity > 0 && (
            <Descriptions.Item label="Цена за единицу">
              {formatCurrency(Math.round(order.finalPrice / order.quantity))}/{order.unit}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Валюта">{order.currency}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* Заметки */}
      {order.notes && (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ padding: "8px 12px", background: token.colorFillQuaternary, borderRadius: 6, fontSize: 13 }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Заметки</Text>
            <Text>{order.notes}</Text>
          </div>
        </div>
      )}

      {/* Даты */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Сроки</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "#1677ff", fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Создан</Text>
            <Text style={{ fontSize: 13 }}>{formatDate(order.createdAt)}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ color: deadline.urgent ? "#ff4d4f" : "#fa8c16", fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Дедлайн</Text>
            <Text style={{ fontSize: 13 }}>{formatDate(order.deadline)}</Text>
            <Tag color={deadline.urgent ? "red" : "blue"} style={{ margin: 0 }}>
              {deadline.text}
            </Tag>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ color: "#8c8c8c", fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Обновлён</Text>
            <Text style={{ fontSize: 13 }}>{formatDate(order.updatedAt)}</Text>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canChangeStatus && order.status !== "completed" && order.status !== "dispute" && currentStep >= 0 && currentStep < ORDER_STEPS.length - 1 && (
            <Button
              type="primary"
              onClick={() => onNextStep(order.id)}
              style={{
                background: "linear-gradient(135deg, #1677ff, #4096ff)",
                borderColor: "transparent",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(22, 119, 255, 0.4)",
              }}
            >
              Перевести в «{ORDER_STEPS[currentStep + 1]?.label}»
            </Button>
          )}
          {canOpenDispute && order.status !== "completed" && order.status !== "dispute" && (
            <Button danger onClick={() => onDispute(order.id)}>Открыть спор</Button>
          )}
          {canSendMessage && (
            <Button icon={<MessageOutlined />}>Написать сообщение</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Empty State ---

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, gap: 24 }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<Text type="secondary">Выберите заказ для просмотра</Text>}
      />
      <div>
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: "block", textAlign: "center" }}>Этапы заказа</Text>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {ORDER_STEPS.map(s => (
            <Tag key={s.status} color={ORDER_STATUS_CONFIG[s.status].color} style={{ margin: 0 }}>
              {s.label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function OrdersPage() {
  const { can } = usePermissions();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [messageApi, contextHolder] = message.useMessage();

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

  // Filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (searchText && !order.lotTitle.toLowerCase().includes(searchText.toLowerCase()) && !order.id.toLowerCase().includes(searchText.toLowerCase()) && !order.supplierCompany.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [orders, statusFilter, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(o => o.status !== "completed" && o.status !== "dispute").length;
    const inProduction = orders.filter(o => o.status === "in_production").length;
    const completed = orders.filter(o => o.status === "completed").length;
    const disputes = orders.filter(o => o.status === "dispute").length;
    const totalValue = orders.reduce((sum, o) => sum + o.finalPrice, 0);
    const completedValue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.finalPrice, 0);
    return { total, active, inProduction, completed, disputes, totalValue, completedValue };
  }, [orders]);

  const selectedOrder = useMemo(() => orders.find(o => o.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  const statusOptions = [
    { value: "all", label: "Все статусы" },
    ...Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ];

  return (
    <PageContainer title={false}>
      {contextHolder}

      {/* Stats */}
      <Card
        size="small"
        style={{ marginBottom: 12, borderRadius: 8 }}
        styles={{ body: { padding: "8px 16px" } }}
      >
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <Statistic title={<Text style={{ fontSize: 11 }}>Всего</Text>} value={stats.total} prefix={<ShoppingCartOutlined />} valueStyle={{ fontSize: 18 }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Активных</Text>} value={stats.active} prefix={<PlayCircleOutlined />} valueStyle={{ fontSize: 18, color: "#1677ff" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>В производстве</Text>} value={stats.inProduction} prefix={<ClockCircleOutlined />} valueStyle={{ fontSize: 18, color: "#fa8c16" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Завершено</Text>} value={stats.completed} prefix={<CheckSquareOutlined />} valueStyle={{ fontSize: 18, color: "#52c41a" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Споры</Text>} value={stats.disputes} prefix={<WarningOutlined />} valueStyle={{ fontSize: 18, color: "#f5222d" }} />
          <Statistic
            title={<Text style={{ fontSize: 11 }}>Общая сумма</Text>}
            value={stats.totalValue}
            prefix={<DollarOutlined />}
            formatter={val => `${(Number(val) / 1_000_000).toFixed(1)}M`}
            suffix="₽"
            valueStyle={{ fontSize: 18, color: "#f59e0b" }}
          />
          <Statistic
            title={<Text style={{ fontSize: 11 }}>Завершено (сумма)</Text>}
            value={stats.completedValue}
            prefix={<DollarOutlined />}
            formatter={val => `${(Number(val) / 1_000_000).toFixed(1)}M`}
            suffix="₽"
            valueStyle={{ fontSize: 18, color: "#52c41a" }}
          />
        </div>
      </Card>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 16, alignItems: "stretch", height: "calc(100vh - 230px)" }}>
        {/* Left: filters + list */}
        <div style={{ flex: "0 0 45%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card
            size="small"
            style={{ marginBottom: 12, borderRadius: 8 }}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                style={{ minWidth: 160 }}
                size="small"
              />
            </div>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Поиск по ID, названию, поставщику..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              size="small"
            />
          </Card>

          <div className="order-list" style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  selected={selectedOrderId === order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                />
              ))
            ) : (
              <Card style={{ borderRadius: 8 }}>
                <Empty description="Нет заказов по выбранным фильтрам" />
              </Card>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={{ flex: "1 1 55%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card style={{ borderRadius: 8, flex: 1, overflow: "auto" }} styles={{ body: { padding: 20 } }}>
            {selectedOrder ? (
              <OrderDetailPanel
                order={selectedOrder}
                canChangeStatus={can("changeOrderStatus")}
                canOpenDispute={can("openDispute")}
                canSendMessage={can("sendMessage")}
                onNextStep={handleNextStep}
                onDispute={handleDispute}
              />
            ) : (
              <EmptyState />
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
