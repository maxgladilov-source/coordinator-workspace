import type { EventInput } from "@fullcalendar/core";

// Helper: get dates relative to current month
function d(day: number, hour = 9, minute = 0): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), day, hour, minute);
  return date.toISOString();
}

export const EVENT_COLORS = {
  lot_review: "#2563eb",
  order: "#f59e0b",
  dispute: "#dc2626",
  meeting: "#7c3aed",
  document: "#16a34a",
} as const;

export type EventType = keyof typeof EVENT_COLORS;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  lot_review: "Проверка лота",
  order: "Заказ",
  dispute: "Спор",
  meeting: "Встреча",
  document: "Документ",
};

// Type-specific extended props

export interface LotReviewProps {
  type: "lot_review";
  description: string;
  lotNumber: string;
  lotTitle: string;
  customerCompany: string;
  category: string;
  priority: "urgent" | "high" | "normal" | "low";
  checksRemaining: number;
  status: string;
}

export interface OrderEventProps {
  type: "order";
  description: string;
  orderId: string;
  lotTitle: string;
  supplierCompany: string;
  customerCompany: string;
  milestone: string;
  finalPrice: string;
  status: string;
  priority: "urgent" | "high" | "normal" | "low";
}

export interface DisputeProps {
  type: "dispute";
  description: string;
  disputeId: string;
  orderId: string;
  disputeType: string;
  initiator: string;
  priority: "critical" | "high" | "medium" | "low";
  deadline: string;
}

export interface MeetingProps {
  type: "meeting";
  description: string;
  participants: string[];
  agenda: string[];
  meetingLink?: string;
  callType: "video" | "phone" | "in-person";
}

export interface DocumentProps {
  type: "document";
  description: string;
  documentType: string;
  requiredBy: string;
  relatedOrder?: string;
  relatedLot?: string;
  status: "pending" | "in_review" | "overdue";
}

export type EventExtendedProps =
  | LotReviewProps
  | OrderEventProps
  | DisputeProps
  | MeetingProps
  | DocumentProps;

export const calendarEvents: EventInput[] = [
  {
    id: "1",
    title: "Проверка лота — Подшипники SKF 6205",
    start: d(2, 10, 0),
    end: d(2, 11, 30),
    color: EVENT_COLORS.lot_review,
    extendedProps: {
      type: "lot_review",
      description: "Срочная проверка технических характеристик. Заказчик ожидает публикацию до конца дня.",
      lotNumber: "LOT-2024-0047",
      lotTitle: "Подшипники SKF 6205-2RS — 500 шт.",
      customerCompany: "ПАО «Уралмаш»",
      category: "Подшипники",
      priority: "urgent",
      checksRemaining: 3,
      status: "На проверке",
    } satisfies LotReviewProps,
  },
  {
    id: "2",
    title: "Дедлайн доставки — Заказ ORD-0891",
    start: d(4, 17, 0),
    color: EVENT_COLORS.order,
    extendedProps: {
      type: "order",
      description: "Крайний срок доставки фрезерованных корпусов. Проверить статус отгрузки у поставщика.",
      orderId: "ORD-0891",
      lotTitle: "Корпуса из алюминия 6061-T6",
      supplierCompany: "ООО «ТехноПром»",
      customerCompany: "ПАО «Уралмаш»",
      milestone: "Доставка",
      finalPrice: "487 500 ₽",
      status: "Отгружен",
      priority: "high",
    } satisfies OrderEventProps,
  },
  {
    id: "3",
    title: "Рассмотрение спора — ORD-0823",
    start: d(6, 14, 0),
    end: d(6, 15, 30),
    color: EVENT_COLORS.dispute,
    extendedProps: {
      type: "dispute",
      description: "Заказчик жалуется на несоответствие качества. Назначено заседание с обеими сторонами.",
      disputeId: "DSP-0012",
      orderId: "ORD-0823",
      disputeType: "Качество",
      initiator: "ПАО «Сибирский механический завод»",
      priority: "high",
      deadline: d(8, 18, 0),
    } satisfies DisputeProps,
  },
  {
    id: "4",
    title: "Планёрка координаторов",
    start: d(7, 10, 0),
    end: d(7, 11, 0),
    color: EVENT_COLORS.meeting,
    extendedProps: {
      type: "meeting",
      description: "Еженедельная планёрка команды координаторов.",
      participants: [
        "Иванов А.С. (Супервайзер)",
        "Петрова М.В. (Координатор)",
        "Сидоров К.Н. (Инженер)",
        "Козлова Е.А. (Координатор)",
      ],
      agenda: [
        "Обзор текущих лотов на проверке",
        "Статус активных споров",
        "Просроченные заказы — план действий",
        "Вопросы и предложения",
      ],
      meetingLink: "https://meet.everypart.pro/room/coord-weekly",
      callType: "video",
    } satisfies MeetingProps,
  },
  {
    id: "5",
    title: "Акт приёмки — ORD-0855",
    start: d(9),
    color: EVENT_COLORS.document,
    extendedProps: {
      type: "document",
      description: "Подписание акта приёмки работ по заказу. Документ должен быть загружен в систему.",
      documentType: "Акт приёмки выполненных работ",
      requiredBy: "Заказчик — ООО «ВолгаМеханика»",
      relatedOrder: "ORD-0855",
      status: "pending",
    } satisfies DocumentProps,
  },
  {
    id: "6",
    title: "Проверка лота — Штамповка кронштейнов",
    start: d(11, 9, 0),
    end: d(11, 10, 30),
    color: EVENT_COLORS.lot_review,
    extendedProps: {
      type: "lot_review",
      description: "Проверка спецификации и чертежей. Обнаружены контактные данные в описании — требуется фильтрация.",
      lotNumber: "LOT-2024-0051",
      lotTitle: "Штамповка кронштейнов из стали 09Г2С — 2000 шт.",
      customerCompany: "АО «Промтехснаб»",
      category: "Штамповка",
      priority: "normal",
      checksRemaining: 5,
      status: "На проверке",
    } satisfies LotReviewProps,
  },
  {
    id: "7",
    title: "Созвон с поставщиком — уточнение по заказу",
    start: d(13, 15, 0),
    end: d(13, 15, 45),
    color: EVENT_COLORS.meeting,
    extendedProps: {
      type: "meeting",
      description: "Уточнение сроков производства и условий отгрузки.",
      participants: [
        "Петрова М.В. (Координатор)",
        "Ли Вэй (ООО «СиноТех»)",
      ],
      agenda: [
        "Уточнение графика производства",
        "Условия упаковки и доставки",
        "Обсуждение отклонений от ТЗ",
      ],
      callType: "phone",
    } satisfies MeetingProps,
  },
  {
    id: "8",
    title: "Подтверждение заказа — ORD-0902",
    start: d(15, 12, 0),
    color: EVENT_COLORS.order,
    extendedProps: {
      type: "order",
      description: "Дедлайн для подтверждения заказа поставщиком. Если не подтвердит — передать следующему.",
      orderId: "ORD-0902",
      lotTitle: "3D-печать прототипов SLS — 30 шт.",
      supplierCompany: "ООО «АддитивПро»",
      customerCompany: "АО «НИИМаш»",
      milestone: "Подтверждение",
      finalPrice: "156 000 ₽",
      status: "Ожидает подтверждения",
      priority: "normal",
    } satisfies OrderEventProps,
  },
  {
    id: "9",
    title: "Крайний срок — решение по спору DSP-0009",
    start: d(17, 18, 0),
    color: EVENT_COLORS.dispute,
    extendedProps: {
      type: "dispute",
      description: "Финальное решение по спору о сроках доставки. Необходимо вынести вердикт.",
      disputeId: "DSP-0009",
      orderId: "ORD-0798",
      disputeType: "Сроки доставки",
      initiator: "АО «НИИМаш»",
      priority: "critical",
      deadline: d(17, 18, 0),
    } satisfies DisputeProps,
  },
  {
    id: "10",
    title: "Проверка лота — Литьё под давлением",
    start: d(19, 11, 0),
    end: d(19, 12, 30),
    color: EVENT_COLORS.lot_review,
    extendedProps: {
      type: "lot_review",
      description: "Сложный лот с нестандартными техтребованиями. Привлечь инженера для проверки.",
      lotNumber: "LOT-2024-0058",
      lotTitle: "Литьё корпусов из ABS — 5000 шт.",
      customerCompany: "ООО «ЭлектроКомплект»",
      category: "Литьё под давлением",
      priority: "high",
      checksRemaining: 7,
      status: "На проверке",
    } satisfies LotReviewProps,
  },
  {
    id: "11",
    title: "Сертификат качества — загрузка в систему",
    start: d(22),
    color: EVENT_COLORS.document,
    extendedProps: {
      type: "document",
      description: "Поставщик должен загрузить сертификат соответствия ГОСТ. Проконтролировать.",
      documentType: "Сертификат соответствия ГОСТ",
      requiredBy: "Координатор — для проверки лота LOT-2024-0051",
      relatedLot: "LOT-2024-0051",
      status: "overdue",
    } satisfies DocumentProps,
  },
  {
    id: "12",
    title: "Производство завершено — ORD-0878",
    start: d(24, 16, 0),
    color: EVENT_COLORS.order,
    extendedProps: {
      type: "order",
      description: "Плановая дата окончания производства. Связаться с поставщиком для подтверждения и организации отгрузки.",
      orderId: "ORD-0878",
      lotTitle: "Токарная обработка валов — 200 шт.",
      supplierCompany: "ООО «МеталлРесурс»",
      customerCompany: "ПАО «Уралмаш»",
      milestone: "Завершение производства",
      finalPrice: "890 000 ₽",
      status: "В производстве",
      priority: "high",
    } satisfies OrderEventProps,
  },
  {
    id: "13",
    title: "Обзорная встреча с руководством",
    start: d(26, 10, 0),
    end: d(26, 11, 30),
    color: EVENT_COLORS.meeting,
    extendedProps: {
      type: "meeting",
      description: "Ежемесячный обзор KPI координаторской команды.",
      participants: [
        "Дмитриев С.П. (Директор)",
        "Иванов А.С. (Супервайзер)",
        "Все координаторы",
      ],
      agenda: [
        "KPI за месяц: лоты, заказы, споры",
        "Нарушения по контактным данным — динамика",
        "Проблемные заказы и эскалации",
        "Планы на следующий месяц",
      ],
      meetingLink: "https://meet.everypart.pro/room/monthly-review",
      callType: "video",
    } satisfies MeetingProps,
  },
  {
    id: "14",
    title: "Дедлайн уточнения — LOT-2024-0044",
    start: d(28, 17, 0),
    color: EVENT_COLORS.lot_review,
    extendedProps: {
      type: "lot_review",
      description: "Заказчик должен предоставить уточнённые чертежи. Если не предоставит — лот будет отклонён.",
      lotNumber: "LOT-2024-0044",
      lotTitle: "Фрезеровка корпусов редукторов — 100 шт.",
      customerCompany: "ООО «ВолгаМеханика»",
      category: "Фрезеровка",
      priority: "normal",
      checksRemaining: 2,
      status: "Уточнение",
    } satisfies LotReviewProps,
  },
];
