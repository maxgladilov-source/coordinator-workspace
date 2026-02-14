export type MessageChannel = "customer" | "supplier" | "system";
export type ConversationStatus = "active" | "waiting" | "resolved";

export const CHANNEL_CONFIG: Record<MessageChannel, { label: string; color: string }> = {
  customer: { label: "Заказчик", color: "blue" },
  supplier: { label: "Поставщик", color: "green" },
  system: { label: "Система", color: "default" },
};

export const CONV_STATUS_CONFIG: Record<ConversationStatus, { label: string; color: string }> = {
  active: { label: "Активный", color: "processing" },
  waiting: { label: "Ожидает ответа", color: "orange" },
  resolved: { label: "Решён", color: "green" },
};

export interface Message {
  id: string;
  from: string;
  fromRole: "coordinator" | "customer" | "supplier" | "system";
  text: string;
  timestamp: string;
  read: boolean;
  filtered: boolean;
  originalText?: string;
}

export interface Conversation {
  id: string;
  subject: string;
  channel: MessageChannel;
  status: ConversationStatus;
  relatedLot?: string;
  relatedOrder?: string;
  participantName: string;
  participantCompany: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

function ago(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "CONV-001",
    subject: "Уточнение по лоту LOT-2026-0003 — тип прокладок",
    channel: "customer",
    status: "waiting",
    relatedLot: "LOT-2026-0003",
    participantName: "Сидоров Дмитрий",
    participantCompany: "ПАО «Нефтемаш»",
    lastMessageAt: ago(3),
    unreadCount: 1,
    messages: [
      {
        id: "msg-001",
        from: "Координатор",
        fromRole: "coordinator",
        text: "Дмитрий, добрый день! По вашему лоту LOT-2026-0003 — уточните, пожалуйста, тип прокладок: паронит или ПТФЭ?",
        timestamp: ago(24),
        read: true,
        filtered: false,
      },
      {
        id: "msg-002",
        from: "Сидоров Дмитрий",
        fromRole: "customer",
        text: "Здравствуйте! Нужен паронит ПОН-Б толщиной 3 мм. Могу скинуть спецификацию на мой email sidorov@neftemash.ru",
        timestamp: ago(3),
        read: false,
        filtered: true,
        originalText: "Здравствуйте! Нужен паронит ПОН-Б толщиной 3 мм. Могу скинуть спецификацию на мой email sidorov@neftemash.ru",
      },
    ],
  },
  {
    id: "CONV-002",
    subject: "Спор по заказу ORD-2026-0003 — жёсткость пружин",
    channel: "supplier",
    status: "active",
    relatedOrder: "ORD-2026-0003",
    participantName: "Ван Хао",
    participantCompany: "Ningbo Spring Tech",
    lastMessageAt: ago(1),
    unreadCount: 2,
    messages: [
      {
        id: "msg-003",
        from: "Координатор",
        fromRole: "coordinator",
        text: "Ван Хао, заказчик заявил несоответствие жёсткости пружин спецификации. Просим предоставить протокол испытаний.",
        timestamp: ago(12),
        read: true,
        filtered: false,
      },
      {
        id: "msg-004",
        from: "Ван Хао",
        fromRole: "supplier",
        text: "Мы провели проверку. Жёсткость в пределах допуска ±5% по DIN 2093. Отправляю протокол.",
        timestamp: ago(6),
        read: true,
        filtered: false,
      },
      {
        id: "msg-005",
        from: "Ван Хао",
        fromRole: "supplier",
        text: "Протокол приложен. Если нужна дополнительная экспертиза — готовы оплатить. Свяжитесь со мной +86-574-8888-1234",
        timestamp: ago(1),
        read: false,
        filtered: true,
        originalText: "Протокол приложен. Если нужна дополнительная экспертиза — готовы оплатить. Свяжитесь со мной +86-574-8888-1234",
      },
    ],
  },
  {
    id: "CONV-003",
    subject: "Подтверждение отгрузки ORD-2026-0002",
    channel: "supplier",
    status: "resolved",
    relatedOrder: "ORD-2026-0002",
    participantName: "Чжан Мин",
    participantCompany: "Jiangsu Precision Casting",
    lastMessageAt: ago(48),
    unreadCount: 0,
    messages: [
      {
        id: "msg-006",
        from: "Координатор",
        fromRole: "coordinator",
        text: "Чжан Мин, подтвердите отгрузку заказа ORD-2026-0002 и предоставьте трек-номер.",
        timestamp: ago(72),
        read: true,
        filtered: false,
      },
      {
        id: "msg-007",
        from: "Чжан Мин",
        fromRole: "supplier",
        text: "Заказ отгружен 12.02. Трек: CN1234567890. Ориентировочный срок доставки — 5-7 рабочих дней.",
        timestamp: ago(48),
        read: true,
        filtered: false,
      },
    ],
  },
  {
    id: "CONV-004",
    subject: "Новый лот LOT-2026-0001 — вопросы по ТЗ",
    channel: "customer",
    status: "active",
    relatedLot: "LOT-2026-0001",
    participantName: "Иванов Алексей",
    participantCompany: "ООО «Механика Плюс»",
    lastMessageAt: ago(5),
    unreadCount: 0,
    messages: [
      {
        id: "msg-008",
        from: "Координатор",
        fromRole: "coordinator",
        text: "Алексей, ваш лот LOT-2026-0001 принят на проверку. Уточните — анодирование цветное или бесцветное?",
        timestamp: ago(8),
        read: true,
        filtered: false,
      },
      {
        id: "msg-009",
        from: "Иванов Алексей",
        fromRole: "customer",
        text: "Бесцветное анодирование, толщина покрытия 15-20 мкм.",
        timestamp: ago(5),
        read: true,
        filtered: false,
      },
    ],
  },
];
