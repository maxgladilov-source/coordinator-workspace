export type DisputeStatus =
  | "open"
  | "under_review"
  | "awaiting_evidence"
  | "in_mediation"
  | "resolved"
  | "escalated"
  | "closed";

export type DisputeType = "quality" | "delivery" | "spec_mismatch" | "quantity" | "documentation";
export type DisputePriority = "critical" | "high" | "medium" | "low";

export const DISPUTE_STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string }> = {
  open: { label: "Открыт", color: "blue" },
  under_review: { label: "На рассмотрении", color: "processing" },
  awaiting_evidence: { label: "Ожидание доказательств", color: "orange" },
  in_mediation: { label: "Медиация", color: "purple" },
  resolved: { label: "Решён", color: "green" },
  escalated: { label: "Эскалирован", color: "red" },
  closed: { label: "Закрыт", color: "default" },
};

export const DISPUTE_TYPE_CONFIG: Record<DisputeType, { label: string; color: string }> = {
  quality: { label: "Качество", color: "#f5222d" },
  delivery: { label: "Доставка", color: "#fa8c16" },
  spec_mismatch: { label: "Несоответствие ТЗ", color: "#722ed1" },
  quantity: { label: "Количество", color: "#1677ff" },
  documentation: { label: "Документация", color: "#13c2c2" },
};

export const DISPUTE_PRIORITY_CONFIG: Record<DisputePriority, { label: string; color: string }> = {
  critical: { label: "Критический", color: "#f5222d" },
  high: { label: "Высокий", color: "#fa541c" },
  medium: { label: "Средний", color: "#fa8c16" },
  low: { label: "Низкий", color: "#52c41a" },
};

export interface DisputeMessage {
  id: string;
  author: string;
  role: "buyer" | "coordinator" | "supplier" | "system";
  text: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderTitle: string;
  title: string;
  description: string;
  type: DisputeType;
  status: DisputeStatus;
  priority: DisputePriority;
  filedBy: string;
  filedAt: string;
  updatedAt: string;
  resolutionDeadline: string;
  amountInDispute: number;
  currency: string;
  evidenceCount: number;
  resolution?: string;
  assignedMediator: string;
  messages: DisputeMessage[];
}

function ago(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function future(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "DSP-001",
    orderId: "ORD-2026-0003",
    orderTitle: "Пружины тарельчатые DIN 2093",
    title: "Несоответствие жёсткости пружин",
    description: "Заказчик заявляет, что жёсткость поставленных пружин не соответствует DIN 2093. Отклонение составляет ~12%, что превышает допустимые ±5%.",
    type: "quality",
    status: "under_review",
    priority: "high",
    filedBy: "Орлов Виктор (ЗАО «МашСервис»)",
    filedAt: ago(3),
    updatedAt: ago(0),
    resolutionDeadline: future(7),
    amountInDispute: 190_000,
    currency: "RUB",
    evidenceCount: 3,
    assignedMediator: "Координатор",
    messages: [
      {
        id: "dsp-msg-001",
        author: "Система",
        role: "system",
        text: "Спор DSP-001 открыт. Причина: несоответствие качества.",
        timestamp: ago(3),
      },
      {
        id: "dsp-msg-002",
        author: "Орлов Виктор",
        role: "buyer",
        text: "Провели входной контроль — жёсткость 12% выше нормы. Прикладываю протокол ОТК.",
        timestamp: ago(3),
      },
      {
        id: "dsp-msg-003",
        author: "Координатор",
        role: "coordinator",
        text: "Приняли. Запрашиваем протокол испытаний у поставщика.",
        timestamp: ago(2),
      },
      {
        id: "dsp-msg-004",
        author: "Ван Хао",
        role: "supplier",
        text: "Наш протокол показывает отклонение ±4.8%. Высылаю документ.",
        timestamp: ago(1),
      },
    ],
  },
  {
    id: "DSP-002",
    orderId: "ORD-2025-0089",
    orderTitle: "Подшипники роликовые 7516",
    title: "Задержка доставки на 14 дней",
    description: "Поставка задержана на 14 дней без предупреждения. Заказчик понёс убытки из-за простоя линии.",
    type: "delivery",
    status: "in_mediation",
    priority: "critical",
    filedBy: "Новиков Пётр (ООО «ТехноЛайн»)",
    filedAt: ago(10),
    updatedAt: ago(1),
    resolutionDeadline: future(3),
    amountInDispute: 450_000,
    currency: "RUB",
    evidenceCount: 5,
    assignedMediator: "Координатор",
    messages: [
      {
        id: "dsp-msg-005",
        author: "Система",
        role: "system",
        text: "Спор DSP-002 открыт. Причина: задержка доставки.",
        timestamp: ago(10),
      },
      {
        id: "dsp-msg-006",
        author: "Новиков Пётр",
        role: "buyer",
        text: "Линия простаивает 14 дней. Убытки ~450 000 ₽. Требуем компенсацию.",
        timestamp: ago(10),
      },
      {
        id: "dsp-msg-007",
        author: "Координатор",
        role: "coordinator",
        text: "Эскалируем. Поставщик, предоставьте объяснение задержки.",
        timestamp: ago(8),
      },
    ],
  },
];
