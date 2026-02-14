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
  Button,
  Modal,
  message,
  theme,
} from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  FileImageOutlined,
  SafetyCertificateOutlined,
  CodeSandboxOutlined,
  FileOutlined,
  BarChartOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import {
  MOCK_LOTS,
  LOT_STATUS_CONFIG,
  REQUIRED_CHECKS,
  type CoordinatorLot,
  type LotStatus,
  type LotCheckItem,
} from "@/lib/lots-mock-data";
import { usePermissions } from "@/contexts/RoleContext";
import "./lots.css";

const { Text, Title, Paragraph } = Typography;

// --- Helpers ---

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${amount.toLocaleString("ru-RU")} ${currency === "RUB" ? "₽" : currency}`;
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

// --- Check icons ---

const CHECK_ICONS: Record<string, React.ReactNode> = {
  pass: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
  fail: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
  warning: <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />,
};

// --- Document helpers ---

type DocumentType = "drawing" | "specification" | "qc_program" | "3d_model" | "report" | "other";

const DOC_TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
  drawing: <FileImageOutlined />,
  qc_program: <SafetyCertificateOutlined />,
  specification: <FileTextOutlined />,
  "3d_model": <CodeSandboxOutlined />,
  report: <BarChartOutlined />,
  other: <FileOutlined />,
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  drawing: "Чертёж",
  qc_program: "Программа КК",
  specification: "Спецификация",
  "3d_model": "3D-модель",
  report: "Отчёт",
  other: "Прочее",
};

const FORMAT_COLORS: Record<string, string> = {
  PDF: "red",
  STEP: "blue",
  DXF: "green",
  STL: "purple",
  ZIP: "orange",
  XLSX: "green",
  DOCX: "geekblue",
};

interface LotDocument {
  id: string;
  name: string;
  type: DocumentType;
  format: string;
  fileSize: string;
}

// Assign documents to lots based on their specs
function getLotDocuments(lot: CoordinatorLot): LotDocument[] {
  const docs: LotDocument[] = [
    { id: `${lot.id}-d1`, name: `${lot.title} — чертёж.pdf`, type: "drawing", format: "PDF", fileSize: "2.4 МБ" },
    { id: `${lot.id}-d2`, name: `Спецификация ${lot.number}.pdf`, type: "specification", format: "PDF", fileSize: "540 КБ" },
  ];
  if (lot.category === "material") {
    docs.push({ id: `${lot.id}-d3`, name: `${lot.title} — 3D.step`, type: "3d_model", format: "STEP", fileSize: "5.1 МБ" });
  }
  return docs;
}

// --- Lot Card ---

function LotCard({
  lot,
  selected,
  onClick,
}: {
  lot: CoordinatorLot;
  selected: boolean;
  onClick: () => void;
}) {
  const statusCfg = LOT_STATUS_CONFIG[lot.status];
  const deadline = getDaysLeft(lot.deliveryDeadline);
  const checksTotal = lot.checks.length;
  const checksDone = lot.checks.filter(c => c.result !== null).length;
  const checksFailed = lot.checks.filter(c => c.result === "fail").length;

  let stateClass = "";
  if (lot.contactViolations > 0) stateClass = " lot-card-violation";
  else if (lot.status === "clarification") stateClass = " lot-card-clarification";
  else if (lot.status === "approved") stateClass = " lot-card-approved";

  return (
    <Card
      size="small"
      className={`lot-card${selected ? " lot-card-selected" : ""}${stateClass}`}
      onClick={onClick}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {/* Left: main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>{lot.number}</Text>
              <div>
                <Text strong style={{ fontSize: 14 }}>{lot.title}</Text>
              </div>
            </div>
            <Tag color={statusCfg.color} style={{ marginLeft: 8, flexShrink: 0 }}>
              {statusCfg.label}
            </Tag>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <Tag style={{ margin: 0 }}>{lot.category === "material" ? "Материал" : lot.category === "digital" ? "Цифровой" : "Услуга"}</Tag>
            {lot.contactViolations > 0 && (
              <Tag color="red" icon={<StopOutlined />} style={{ margin: 0 }}>Контакт</Tag>
            )}
            {Object.entries(lot.technicalSpecs).slice(0, 1).map(([k, v]) => (
              <Tag key={k} style={{ margin: 0 }}>{v}</Tag>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{lot.customerCompany}</Text>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatDate(lot.deliveryDeadline)}</Text>
              <Tag color={deadline.urgent ? "red" : "blue"} style={{ margin: 0, fontSize: 11 }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{deadline.text}
              </Tag>
            </div>
          </div>
        </div>

        {/* Right: budget + checks badge */}
        <div
          className="lot-card-badge"
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
          {lot.budget && (
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>
              {formatCurrency(lot.budget, lot.currency)}
            </span>
          )}
          <span style={{ fontSize: 13, color: "#1677ff", marginTop: 4 }}>
            {lot.quantity.toLocaleString("ru-RU")} {lot.unit}
          </span>
          <span style={{ fontSize: 11, marginTop: 4, color: checksFailed > 0 ? "#f5222d" : checksDone === checksTotal ? "#52c41a" : "#8c8c8c" }}>
            {checksDone}/{checksTotal} проверок
          </span>
        </div>
      </div>
    </Card>
  );
}

// --- Documents Section ---

function DocumentsSection({ lot }: { lot: CoordinatorLot }) {
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const documents = getLotDocuments(lot);

  const handleDownload = (doc: LotDocument) => {
    messageApi.info(`Скачивание ${doc.name}...`);
  };

  return (
    <div>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Text strong style={{ fontSize: 13 }}>Документы ({documents.length})</Text>
        <Button icon={<DownloadOutlined />} size="small" onClick={() => messageApi.info(`Скачивание ${documents.length} файлов...`)}>
          Скачать все
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {documents.map(doc => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 6,
              background: token.colorFillQuaternary,
              cursor: "pointer",
            }}
            onClick={() => handleDownload(doc)}
          >
            <span style={{ fontSize: 16, color: "#8c8c8c", flexShrink: 0 }}>
              {DOC_TYPE_ICONS[doc.type]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13, display: "block" }} ellipsis={{ tooltip: doc.name }}>{doc.name}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{DOC_TYPE_LABELS[doc.type]}</Text>
            </div>
            <Tag color={FORMAT_COLORS[doc.format] || "default"} style={{ margin: 0, fontSize: 11 }}>{doc.format}</Tag>
            <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, minWidth: 52, textAlign: "right" }}>{doc.fileSize}</Text>
            <DownloadOutlined style={{ color: "#1677ff", fontSize: 14, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Detail Panel ---

function LotDetailPanel({
  lot,
  canCheck,
  canApprove,
  canReject,
  canPublish,
  onCheck,
  onClarify,
  onApprove,
  onReject,
  onPublish,
}: {
  lot: CoordinatorLot;
  canCheck: boolean;
  canApprove: boolean;
  canReject: boolean;
  canPublish: boolean;
  onCheck: (lotId: string, checkName: string, result: "pass" | "fail" | "warning") => void;
  onClarify: (lotId: string, reason: string) => void;
  onApprove: (lotId: string) => void;
  onReject: (lotId: string) => void;
  onPublish: (lotId: string) => void;
}) {
  const { token } = theme.useToken();
  const statusCfg = LOT_STATUS_CONFIG[lot.status];
  const deadline = getDaysLeft(lot.deliveryDeadline);
  const [clarifyReason, setClarifyReason] = useState("");

  const isEditable = lot.status === "pending_review" || lot.status === "clarification";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
          <Tag>{lot.category === "material" ? "Материал" : lot.category === "digital" ? "Цифровой" : "Услуга"}</Tag>
          {lot.contactViolations > 0 && (
            <Tag color="red" icon={<StopOutlined />}>Контакт: {lot.contactViolations}</Tag>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>{lot.number}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>·</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>Создан {formatDate(lot.createdAt)}</Text>
        </div>
        <Title level={5} style={{ margin: 0 }}>{lot.title}</Title>
      </div>

      {/* Технические характеристики */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Технические характеристики</Text>
        <Descriptions column={2} size="small" colon={false}>
          {Object.entries(lot.technicalSpecs).map(([k, v]) => (
            <Descriptions.Item key={k} label={k}>{v}</Descriptions.Item>
          ))}
          <Descriptions.Item label="Количество">{lot.quantity.toLocaleString("ru-RU")} {lot.unit}</Descriptions.Item>
          {lot.budget && (
            <Descriptions.Item label="Бюджет">{formatCurrency(lot.budget, lot.currency)}</Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Информация о доставке */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Доставка</Text>
        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item label="Адрес" span={2}>{lot.deliveryAddress}</Descriptions.Item>
          <Descriptions.Item label="Срок">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {formatDate(lot.deliveryDeadline)}
              <Tag color={deadline.urgent ? "red" : "blue"} style={{ margin: 0 }}>
                <ClockCircleOutlined style={{ marginRight: 3 }} />{deadline.text}
              </Tag>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Заказчик */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Заказчик</Text>
        <Descriptions column={2} size="small" colon={false}>
          <Descriptions.Item label="Контактное лицо">{lot.customerName}</Descriptions.Item>
          <Descriptions.Item label="Компания">{lot.customerCompany}</Descriptions.Item>
          <Descriptions.Item label="ID">{lot.customerId}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* Описание */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Описание</Text>
        <Paragraph style={{ margin: 0, fontSize: 13 }}>{lot.description}</Paragraph>
      </div>

      {/* Чек-лист */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Чек-лист проверки</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, padding: "4px 8px", borderRadius: "4px 4px 0 0", background: token.colorFillSecondary, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
            <Text style={{ fontSize: 11, fontWeight: 600, color: token.colorTextSecondary }}>Проверка</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, minWidth: 70, textAlign: "center", color: token.colorTextSecondary }}>Результат</Text>
            <Text style={{ fontSize: 11, fontWeight: 600, minWidth: 140, textAlign: "right", color: token.colorTextSecondary }}>Действия</Text>
          </div>
          {lot.checks.map((check, i) => (
            <div key={check.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, padding: "6px 8px", alignItems: "center", borderBottom: i < lot.checks.length - 1 ? `1px solid ${token.colorBorderSecondary}` : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>
                  {check.result ? CHECK_ICONS[check.result] : <QuestionCircleOutlined style={{ color: "#d9d9d9" }} />}
                </span>
                <div>
                  <Text style={{ fontSize: 12 }}>{check.label}</Text>
                  {check.comment && <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{check.comment}</Text>}
                </div>
              </div>
              <div style={{ minWidth: 70, textAlign: "center" }}>
                {check.result ? (
                  <Tag color={check.result === "pass" ? "green" : check.result === "fail" ? "red" : "orange"} style={{ margin: 0, fontSize: 11 }}>
                    {check.result === "pass" ? "OK" : check.result === "fail" ? "Fail" : "!"}
                  </Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0, fontSize: 11 }}>—</Tag>
                )}
              </div>
              <div style={{ minWidth: 140, textAlign: "right" }}>
                {canCheck && isEditable && (
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <Button size="small" type="primary" ghost onClick={() => onCheck(lot.id, check.name, "pass")}>OK</Button>
                    <Button size="small" danger ghost onClick={() => onCheck(lot.id, check.name, "fail")}>Fail</Button>
                    <Button size="small" style={{ color: "#fa8c16", borderColor: "#fa8c16" }} ghost onClick={() => onCheck(lot.id, check.name, "warning")}>!</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Документы */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <DocumentsSection lot={lot} />
      </div>

      {/* Заметки координатора */}
      {lot.coordinatorNotes && (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ padding: "8px 12px", background: token.colorFillQuaternary, borderRadius: 6 }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Заметки координатора</Text>
            <Text>{lot.coordinatorNotes}</Text>
          </div>
        </div>
      )}

      {/* Причина отклонения */}
      {lot.rejectionReason && (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <div style={{ padding: "8px 12px", background: "#fff2f0", borderRadius: 6, border: "1px solid #ffccc7" }}>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>Причина отклонения</Text>
            <Text type="danger">{lot.rejectionReason}</Text>
          </div>
        </div>
      )}

      {/* Даты */}
      <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <Text strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Хронология</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarOutlined style={{ color: "#1677ff", fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Создан</Text>
            <Text style={{ fontSize: 13 }}>{formatDate(lot.createdAt)}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ color: "#fa8c16", fontSize: 13 }} />
            <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Обновлён</Text>
            <Text style={{ fontSize: 13 }}>{formatDate(lot.updatedAt)}</Text>
          </div>
          {lot.publishedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 13 }} />
              <Text type="secondary" style={{ fontSize: 12, width: 100 }}>Опубликован</Text>
              <Text style={{ fontSize: 13 }}>{formatDate(lot.publishedAt)}</Text>
            </div>
          )}
        </div>
      </div>

      {/* Действия */}
      {(canApprove || canReject) && isEditable && (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>Действия</Text>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                placeholder="Причина уточнения..."
                value={clarifyReason}
                onChange={e => setClarifyReason(e.target.value)}
                style={{ flex: 1 }}
                size="small"
              />
              <Button size="small" onClick={() => { onClarify(lot.id, clarifyReason); setClarifyReason(""); }}>
                Уточнение
              </Button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {canApprove && (
                <Button
                  type="primary"
                  onClick={() => onApprove(lot.id)}
                  style={{ background: "linear-gradient(135deg, #52c41a, #73d13d)", borderColor: "transparent", fontWeight: 600 }}
                >
                  Одобрить
                </Button>
              )}
              {canReject && (
                <Button danger onClick={() => onReject(lot.id)}>Отклонить</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Публикация */}
      {canPublish && lot.status === "approved" && (
        <div style={{ padding: "12px 0", borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <Button
            type="primary"
            size="large"
            block
            onClick={() => onPublish(lot.id)}
            style={{
              background: "linear-gradient(135deg, #1677ff, #4096ff)",
              borderColor: "transparent",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(22, 119, 255, 0.4)",
            }}
          >
            Опубликовать на LotMarket
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Empty State ---

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, gap: 24 }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<Text type="secondary">Выберите лот для проверки</Text>}
      />
      <div>
        <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: "block", textAlign: "center" }}>Статусы лотов</Text>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {Object.entries(LOT_STATUS_CONFIG).map(([key, cfg]) => (
            <Tag key={key} color={cfg.color} style={{ margin: 0 }}>{cfg.label}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function LotsPage() {
  const { can } = usePermissions();
  const [lots, setLots] = useState(MOCK_LOTS);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Handlers
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
    messageApi.success(`Проверка — ${result === "pass" ? "OK" : result === "fail" ? "не пройдена" : "внимание"}`);
  };

  const handleClarify = (lotId: string, reason: string) => {
    setLots(prev => prev.map(l =>
      l.id === lotId ? { ...l, status: "clarification" as LotStatus, coordinatorNotes: reason } : l
    ));
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

  // Filter
  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      if (statusFilter !== "all" && lot.status !== statusFilter) return false;
      if (searchText && !lot.title.toLowerCase().includes(searchText.toLowerCase()) && !lot.number.toLowerCase().includes(searchText.toLowerCase()) && !lot.customerCompany.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [lots, statusFilter, searchText]);

  // Stats
  const stats = useMemo(() => {
    const pending = lots.filter(l => l.status === "pending_review").length;
    const clarification = lots.filter(l => l.status === "clarification").length;
    const approved = lots.filter(l => l.status === "approved").length;
    const published = lots.filter(l => l.status === "published").length;
    const rejected = lots.filter(l => l.status === "rejected").length;
    const violations = lots.reduce((sum, l) => sum + l.contactViolations, 0);
    const totalBudget = lots.filter(l => l.budget).reduce((sum, l) => sum + (l.budget ?? 0), 0);
    return { total: lots.length, pending, clarification, approved, published, rejected, violations, totalBudget };
  }, [lots]);

  const selectedLot = useMemo(() => lots.find(l => l.id === selectedLotId) ?? null, [lots, selectedLotId]);

  const statusOptions = [
    { value: "all", label: "Все статусы" },
    ...Object.entries(LOT_STATUS_CONFIG).map(([key, cfg]) => ({ value: key, label: cfg.label })),
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
          <Statistic title={<Text style={{ fontSize: 11 }}>Всего</Text>} value={stats.total} prefix={<FileSearchOutlined />} valueStyle={{ fontSize: 18 }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>На проверке</Text>} value={stats.pending} prefix={<PlayCircleOutlined />} valueStyle={{ fontSize: 18, color: "#1677ff" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Уточнение</Text>} value={stats.clarification} prefix={<ExclamationCircleOutlined />} valueStyle={{ fontSize: 18, color: "#fa8c16" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Одобрено</Text>} value={stats.approved} prefix={<CheckCircleOutlined />} valueStyle={{ fontSize: 18, color: "#52c41a" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Опубликовано</Text>} value={stats.published} prefix={<CheckSquareOutlined />} valueStyle={{ fontSize: 18, color: "#13c2c2" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Отклонено</Text>} value={stats.rejected} prefix={<CloseCircleOutlined />} valueStyle={{ fontSize: 18, color: "#f5222d" }} />
          <Statistic title={<Text style={{ fontSize: 11 }}>Нарушения</Text>} value={stats.violations} prefix={<WarningOutlined />} valueStyle={{ fontSize: 18, color: "#f5222d" }} />
          <Statistic
            title={<Text style={{ fontSize: 11 }}>Общий бюджет</Text>}
            value={stats.totalBudget}
            formatter={val => `${(Number(val) / 1_000_000).toFixed(1)}M`}
            suffix="₽"
            valueStyle={{ fontSize: 18, color: "#f59e0b" }}
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
              placeholder="Поиск по номеру, названию, компании..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              size="small"
            />
          </Card>

          <div className="lot-list" style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            {filteredLots.length > 0 ? (
              filteredLots.map(lot => (
                <LotCard
                  key={lot.id}
                  lot={lot}
                  selected={selectedLotId === lot.id}
                  onClick={() => setSelectedLotId(lot.id)}
                />
              ))
            ) : (
              <Card style={{ borderRadius: 8 }}>
                <Empty description="Нет лотов по выбранным фильтрам" />
              </Card>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div style={{ flex: "1 1 55%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card style={{ borderRadius: 8, flex: 1, overflow: "auto" }} styles={{ body: { padding: 20 } }}>
            {selectedLot ? (
              <LotDetailPanel
                lot={selectedLot}
                canCheck={can("checkLot")}
                canApprove={can("approveLot")}
                canReject={can("rejectLot")}
                canPublish={can("publishLot")}
                onCheck={handleCheck}
                onClarify={handleClarify}
                onApprove={handleApprove}
                onReject={() => setShowRejectModal(true)}
                onPublish={handlePublish}
              />
            ) : (
              <EmptyState />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title="Отклонить лот"
        open={showRejectModal}
        onOk={() => selectedLot && handleReject(selectedLot.id)}
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
