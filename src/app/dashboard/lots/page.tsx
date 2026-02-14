"use client";

import { useState, useMemo } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Typography, Input, Descriptions, Button, Radio, message, Modal } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { MOCK_LOTS, LOT_STATUS_CONFIG, REQUIRED_CHECKS } from "@/lib/lots-mock-data";
import type { CoordinatorLot, LotStatus, LotCheckItem } from "@/lib/lots-mock-data";

const { Text, Title } = Typography;

const CHECK_ICONS: Record<string, React.ReactNode> = {
  pass: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  fail: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
  warning: <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU");
}

export default function LotsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LotStatus | "">("");
  const [search, setSearch] = useState("");
  const [lots, setLots] = useState(MOCK_LOTS);
  const [clarifyReason, setClarifyReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const filtered = useMemo(() => {
    let result = lots;
    if (statusFilter) result = result.filter(l => l.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.number.toLowerCase().includes(q) ||
        l.customerCompany.toLowerCase().includes(q)
      );
    }
    return result;
  }, [lots, statusFilter, search]);

  const selected = lots.find(l => l.id === selectedId) ?? null;

  const handleCheck = (lotId: string, checkName: string, result: "pass" | "fail" | "warning") => {
    setLots(prev => prev.map(l => {
      if (l.id !== lotId) return l;
      return {
        ...l,
        checks: l.checks.map(c =>
          c.name === checkName ? { ...c, result, checkedAt: new Date().toISOString() } : c
        ),
      };
    }));
    messageApi.success(`Проверка «${REQUIRED_CHECKS.find(c => c.name === checkName)?.label}» — ${result === "pass" ? "OK" : result === "fail" ? "не пройдена" : "внимание"}`);
  };

  const handleClarify = (lotId: string) => {
    setLots(prev => prev.map(l =>
      l.id === lotId ? { ...l, status: "clarification" as LotStatus, coordinatorNotes: clarifyReason } : l
    ));
    setClarifyReason("");
    messageApi.info("Запрос на уточнение отправлен");
  };

  const handleApprove = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    const allPassed = lot.checks.every(c => c.result === "pass");
    if (!allPassed) {
      messageApi.error("Не все проверки пройдены");
      return;
    }
    setLots(prev => prev.map(l =>
      l.id === lotId ? { ...l, status: "approved" as LotStatus } : l
    ));
    messageApi.success("Лот одобрен");
  };

  const handleReject = (lotId: string) => {
    setLots(prev => prev.map(l =>
      l.id === lotId ? { ...l, status: "rejected" as LotStatus, rejectionReason: rejectReason } : l
    ));
    setRejectReason("");
    setShowRejectModal(false);
    messageApi.warning("Лот отклонён");
  };

  const handlePublish = (lotId: string) => {
    setLots(prev => prev.map(l =>
      l.id === lotId ? { ...l, status: "published" as LotStatus, publishedAt: new Date().toISOString() } : l
    ));
    messageApi.success("Лот опубликован на маркете");
  };

  return (
    <PageContainer title="Проверка лотов" subTitle="Контроль качества информации перед публикацией">
      {contextHolder}
      <div style={{ display: "flex", gap: 24 }}>
        {/* Left: list */}
        <div style={{ width: 400, flexShrink: 0 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Поиск по номеру, названию, компании..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Radio.Group
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 4 }}
          >
            <Radio.Button value="">Все</Radio.Button>
            <Radio.Button value="pending_review">На проверке</Radio.Button>
            <Radio.Button value="clarification">Уточнение</Radio.Button>
            <Radio.Button value="approved">Одобрен</Radio.Button>
            <Radio.Button value="published">Опубликован</Radio.Button>
            <Radio.Button value="rejected">Отклонён</Radio.Button>
          </Radio.Group>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            {filtered.map(lot => {
              const cfg = LOT_STATUS_CONFIG[lot.status];
              return (
                <Card
                  key={lot.id}
                  size="small"
                  hoverable
                  onClick={() => setSelectedId(lot.id)}
                  style={{
                    borderLeft: selectedId === lot.id ? "4px solid #2563eb" : "4px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 12, color: "#8c8c8c" }}>{lot.number}</Text>
                    <Tag color={cfg.color}>{cfg.label}</Tag>
                    {lot.contactViolations > 0 && <Tag color="red" icon={<StopOutlined />}>Контакт</Tag>}
                  </div>
                  <Text strong style={{ fontSize: 14, display: "block" }}>{lot.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{lot.customerCompany} | {lot.quantity} {lot.unit}</Text>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <Text type="secondary">{selected.number}</Text>
                  <Title level={4} style={{ margin: "4px 0 8px" }}>{selected.title}</Title>
                  <Tag color={LOT_STATUS_CONFIG[selected.status].color}>{LOT_STATUS_CONFIG[selected.status].label}</Tag>
                </div>
              </div>

              <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Заказчик">{selected.customerName}</Descriptions.Item>
                <Descriptions.Item label="Компания">{selected.customerCompany}</Descriptions.Item>
                <Descriptions.Item label="Категория">{selected.category}</Descriptions.Item>
                <Descriptions.Item label="Количество">{selected.quantity} {selected.unit}</Descriptions.Item>
                <Descriptions.Item label="Бюджет">{selected.budget ? `${selected.budget.toLocaleString("ru-RU")} ${selected.currency}` : "—"}</Descriptions.Item>
                <Descriptions.Item label="Срок поставки">{formatDate(selected.deliveryDeadline)}</Descriptions.Item>
                <Descriptions.Item label="Адрес доставки" span={2}>{selected.deliveryAddress}</Descriptions.Item>
                <Descriptions.Item label="Описание" span={2}>{selected.description}</Descriptions.Item>
              </Descriptions>

              {/* Технические характеристики */}
              {Object.keys(selected.technicalSpecs).length > 0 && (
                <Card size="small" title="Технические характеристики" style={{ marginBottom: 20 }}>
                  <Descriptions column={2} size="small">
                    {Object.entries(selected.technicalSpecs).map(([k, v]) => (
                      <Descriptions.Item key={k} label={k}>{v}</Descriptions.Item>
                    ))}
                  </Descriptions>
                </Card>
              )}

              {/* Чек-лист */}
              <Card size="small" title="Чек-лист проверки" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.checks.map(check => (
                    <div key={check.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", border: "1px solid #f0f0f0", borderRadius: 8 }}>
                      <span style={{ fontSize: 18 }}>
                        {check.result ? CHECK_ICONS[check.result] : <QuestionCircleOutlined style={{ color: "#d9d9d9" }} />}
                      </span>
                      <Text style={{ flex: 1, fontSize: 13 }}>{check.label}</Text>
                      {check.comment && <Text type="secondary" style={{ fontSize: 12 }}>{check.comment}</Text>}
                      {(selected.status === "pending_review" || selected.status === "clarification") && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <Button size="small" type="primary" ghost onClick={() => handleCheck(selected.id, check.name, "pass")}>OK</Button>
                          <Button size="small" danger ghost onClick={() => handleCheck(selected.id, check.name, "fail")}>Fail</Button>
                          <Button size="small" style={{ color: "#fa8c16", borderColor: "#fa8c16" }} ghost onClick={() => handleCheck(selected.id, check.name, "warning")}>!</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Заметки и действия */}
              {selected.coordinatorNotes && (
                <Card size="small" title="Заметки координатора" style={{ marginBottom: 20 }}>
                  <Text>{selected.coordinatorNotes}</Text>
                </Card>
              )}

              {selected.rejectionReason && (
                <Card size="small" title="Причина отклонения" style={{ marginBottom: 20, borderColor: "#f5222d" }}>
                  <Text type="danger">{selected.rejectionReason}</Text>
                </Card>
              )}

              {/* Действия */}
              {(selected.status === "pending_review" || selected.status === "clarification") && (
                <Card size="small" title="Действия" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Input
                        placeholder="Причина уточнения..."
                        value={clarifyReason}
                        onChange={e => setClarifyReason(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Button type="default" onClick={() => handleClarify(selected.id)}>Запросить уточнение</Button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button type="primary" onClick={() => handleApprove(selected.id)}>Одобрить</Button>
                      <Button danger onClick={() => setShowRejectModal(true)}>Отклонить</Button>
                    </div>
                  </div>
                </Card>
              )}

              {selected.status === "approved" && (
                <Button type="primary" size="large" block onClick={() => handlePublish(selected.id)}>
                  Опубликовать на LotMarket
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: "center", padding: 60, color: "#8c8c8c" }}>
                <FileSearchOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <br />
                Выберите лот для проверки
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        title="Отклонить лот"
        open={showRejectModal}
        onOk={() => selected && handleReject(selected.id)}
        onCancel={() => setShowRejectModal(false)}
        okText="Отклонить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          rows={3}
          placeholder="Причина отклонения..."
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>
    </PageContainer>
  );
}
