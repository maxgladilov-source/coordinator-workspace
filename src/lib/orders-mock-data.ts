export type OrderStatus =
  | "won"
  | "confirmed"
  | "in_production"
  | "shipped"
  | "delivered"
  | "completed"
  | "dispute";

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  won: { label: "Выигран", color: "blue" },
  confirmed: { label: "Подтверждён", color: "processing" },
  in_production: { label: "В производстве", color: "purple" },
  shipped: { label: "Отгружен", color: "cyan" },
  delivered: { label: "Доставлен", color: "lime" },
  completed: { label: "Завершён", color: "green" },
  dispute: { label: "Спор", color: "red" },
};

export const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "won", label: "Выигран" },
  { status: "confirmed", label: "Подтверждён" },
  { status: "in_production", label: "В производстве" },
  { status: "shipped", label: "Отгружен" },
  { status: "delivered", label: "Доставлен" },
  { status: "completed", label: "Завершён" },
];

export interface CoordinatorOrder {
  id: string;
  lotId: string;
  lotNumber: string;
  lotTitle: string;
  status: OrderStatus;
  supplierName: string;
  supplierCompany: string;
  customerName: string;
  customerCompany: string;
  finalPrice: number;
  currency: string;
  quantity: number;
  unit: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
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

export const MOCK_ORDERS: CoordinatorOrder[] = [
  {
    id: "ORD-2026-0001",
    lotId: "LOT-2026-0005",
    lotNumber: "LOT-2026-0005",
    lotTitle: "Крепёж высокопрочный — набор М16-М24",
    status: "in_production",
    supplierName: "Ли Вэй",
    supplierCompany: "Shanghai MetalParts Co.",
    customerName: "Волков Сергей",
    customerCompany: "ООО «СтройМетиз»",
    finalPrice: 385_000,
    currency: "RUB",
    quantity: 5000,
    unit: "шт",
    notes: "Поставщик подтвердил сроки. Производство начато.",
    createdAt: ago(7),
    updatedAt: ago(1),
    deadline: future(14),
  },
  {
    id: "ORD-2026-0002",
    lotId: "LOT-2025-0088",
    lotNumber: "LOT-2025-0088",
    lotTitle: "Втулки бронзовые БрАЖ9-4",
    status: "shipped",
    supplierName: "Чжан Мин",
    supplierCompany: "Jiangsu Precision Casting",
    customerName: "Белов Олег",
    customerCompany: "ООО «ПромЛит»",
    finalPrice: 520_000,
    currency: "RUB",
    quantity: 400,
    unit: "шт",
    notes: "Отгружено 12.02. Трек-номер: CN1234567890.",
    createdAt: ago(21),
    updatedAt: ago(2),
    deadline: future(5),
  },
  {
    id: "ORD-2026-0003",
    lotId: "LOT-2025-0072",
    lotNumber: "LOT-2025-0072",
    lotTitle: "Пружины тарельчатые DIN 2093",
    status: "dispute",
    supplierName: "Ван Хао",
    supplierCompany: "Ningbo Spring Tech",
    customerName: "Орлов Виктор",
    customerCompany: "ЗАО «МашСервис»",
    finalPrice: 190_000,
    currency: "RUB",
    quantity: 2000,
    unit: "шт",
    notes: "Заказчик заявляет несоответствие жёсткости. Идёт проверка.",
    createdAt: ago(35),
    updatedAt: ago(0),
    deadline: ago(5),
  },
  {
    id: "ORD-2026-0004",
    lotId: "LOT-2025-0095",
    lotNumber: "LOT-2025-0095",
    lotTitle: "Корпус насоса — чугун СЧ25",
    status: "completed",
    supplierName: "Хуан Цзянь",
    supplierCompany: "Dalian Heavy Machinery",
    customerName: "Фёдоров Игорь",
    customerCompany: "ПАО «НасосЭнерго»",
    finalPrice: 1_750_000,
    currency: "RUB",
    quantity: 30,
    unit: "шт",
    notes: "Заказ успешно завершён. Качество подтверждено.",
    createdAt: ago(60),
    updatedAt: ago(10),
    deadline: ago(12),
  },
  {
    id: "ORD-2026-0005",
    lotId: "LOT-2025-0101",
    lotNumber: "LOT-2025-0101",
    lotTitle: "Шпильки резьбовые М30×300",
    status: "won",
    supplierName: "Чэнь Лян",
    supplierCompany: "Qingdao Fastener Group",
    customerName: "Кузнецов Артём",
    customerCompany: "ООО «ЭнергоМонтаж»",
    finalPrice: 275_000,
    currency: "RUB",
    quantity: 800,
    unit: "шт",
    notes: "Ожидаем подтверждение от поставщика.",
    createdAt: ago(1),
    updatedAt: ago(0),
    deadline: future(40),
  },
];
