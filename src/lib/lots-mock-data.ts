export type LotStatus =
  | "draft"
  | "pending_review"
  | "clarification"
  | "approved"
  | "published"
  | "rejected";

export const LOT_STATUS_CONFIG: Record<LotStatus, { label: string; color: string }> = {
  draft: { label: "Черновик", color: "default" },
  pending_review: { label: "На проверке", color: "processing" },
  clarification: { label: "Уточнение", color: "orange" },
  approved: { label: "Одобрен", color: "green" },
  published: { label: "Опубликован", color: "cyan" },
  rejected: { label: "Отклонён", color: "red" },
};

export type LotCategory = "material" | "digital" | "service";

export interface LotCheckItem {
  name: string;
  label: string;
  result: "pass" | "fail" | "warning" | null;
  comment: string | null;
  checkedAt: string | null;
}

export interface CoordinatorLot {
  id: string;
  number: string;
  title: string;
  description: string;
  category: LotCategory;
  quantity: number;
  unit: string;
  budget: number | null;
  currency: string;
  deliveryAddress: string;
  deliveryDeadline: string;
  technicalSpecs: Record<string, string>;
  status: LotStatus;
  customerId: string;
  coordinatorNotes: string;
  rejectionReason: string;
  contactViolations: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  checks: LotCheckItem[];
  modelUrl?: string;
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

const REQUIRED_CHECKS: Omit<LotCheckItem, "result" | "comment" | "checkedAt">[] = [
  { name: "title_quality", label: "Качество заголовка" },
  { name: "description_completeness", label: "Полнота описания" },
  { name: "specs_validity", label: "Корректность ТХ" },
  { name: "quantity_unit", label: "Количество и единицы измерения" },
  { name: "delivery_info", label: "Информация о доставке" },
  { name: "budget_adequacy", label: "Адекватность бюджета" },
  { name: "no_contact_info", label: "Отсутствие контактных данных" },
  { name: "category_correct", label: "Правильная категория" },
];

export { REQUIRED_CHECKS };

export const MOCK_LOTS: CoordinatorLot[] = [
  {
    id: "LOT-2026-0001",
    number: "LOT-2026-0001",
    title: "Корпус редуктора — алюминиевое литьё",
    description: "Требуется изготовление корпуса редуктора из алюминиевого сплава АК12. Литьё под давлением, механическая обработка по чертежу. Допуск по H7. Поверхность — анодирование.",
    category: "material",
    quantity: 200,
    unit: "шт",
    budget: 1_450_000,
    currency: "RUB",
    deliveryAddress: "г. Москва, ул. Промышленная, 15",
    deliveryDeadline: future(45),
    technicalSpecs: {
      "Материал": "АК12 (AlSi12)",
      "Метод": "Литьё под давлением",
      "Допуск": "H7",
      "Покрытие": "Анодирование",
      "Масса детали": "1.2 кг",
    },
    status: "pending_review",
    customerId: "CMP-00012",
    coordinatorNotes: "",
    rejectionReason: "",
    contactViolations: 0,
    createdAt: ago(2),
    updatedAt: ago(1),
    publishedAt: null,
    checks: REQUIRED_CHECKS.map(c => ({ ...c, result: null, comment: null, checkedAt: null })),
    modelUrl: "/models/model 1.glb",
  },
  {
    id: "LOT-2026-0002",
    number: "LOT-2026-0002",
    title: "Вал приводной — сталь 40Х",
    description: "Изготовление приводного вала из стали 40Х. Токарная обработка, шлифовка, закалка HRC 45-50. Партия 50 шт. Чертёж прилагается. Мой телефон 8-900-123-45-67 для связи.",
    category: "material",
    quantity: 50,
    unit: "шт",
    budget: 680_000,
    currency: "RUB",
    deliveryAddress: "г. Екатеринбург, пр-т Космонавтов, 8",
    deliveryDeadline: future(30),
    technicalSpecs: {
      "Материал": "Сталь 40Х",
      "Обработка": "Токарная + шлифовка",
      "Закалка": "HRC 45-50",
      "Длина": "450 мм",
      "Диаметр": "60 мм",
    },
    status: "pending_review",
    customerId: "CMP-00024",
    coordinatorNotes: "Обнаружен телефон в описании — нарушение правил",
    rejectionReason: "",
    contactViolations: 1,
    createdAt: ago(1),
    updatedAt: ago(0),
    publishedAt: null,
    checks: REQUIRED_CHECKS.map((c, i) => ({
      ...c,
      result: i === 6 ? "fail" as const : null,
      comment: i === 6 ? "Обнаружен номер телефона в описании" : null,
      checkedAt: i === 6 ? ago(0) : null,
    })),
    modelUrl: "/models/model 2.glb",
  },
  {
    id: "LOT-2026-0003",
    number: "LOT-2026-0003",
    title: "Фланец стальной Ду200",
    description: "Фланцы стальные приварные встык по ГОСТ 12821-80. Ду200, Ру16. Сталь 09Г2С. Комплект с прокладками и крепежом.",
    category: "material",
    quantity: 120,
    unit: "шт",
    budget: 890_000,
    currency: "RUB",
    deliveryAddress: "г. Казань, ул. Заводская, 42",
    deliveryDeadline: future(60),
    technicalSpecs: {
      "ГОСТ": "12821-80",
      "Ду": "200 мм",
      "Ру": "16 кгс/см²",
      "Материал": "09Г2С",
      "Комплектация": "Фланец + прокладка + крепёж",
    },
    status: "clarification",
    customerId: "CMP-00037",
    coordinatorNotes: "Запросил уточнение по типу прокладок — паронит или ПТФЭ?",
    rejectionReason: "",
    contactViolations: 0,
    createdAt: ago(5),
    updatedAt: ago(1),
    publishedAt: null,
    checks: REQUIRED_CHECKS.map((c, i) => ({
      ...c,
      result: [0, 1, 3, 5, 7].includes(i) ? "pass" as const : i === 2 ? "warning" as const : null,
      comment: i === 2 ? "Не указан тип прокладок" : null,
      checkedAt: [0, 1, 2, 3, 5, 7].includes(i) ? ago(2) : null,
    })),
  },
  {
    id: "LOT-2026-0004",
    number: "LOT-2026-0004",
    title: "Шестерня коническая — модуль 4",
    description: "Зубчатое колесо коническое, модуль 4, z=28. Сталь 20ХН3А, цементация. Партия 300 шт.",
    category: "material",
    quantity: 300,
    unit: "шт",
    budget: 2_100_000,
    currency: "RUB",
    deliveryAddress: "г. Новосибирск, ул. Станционная, 3",
    deliveryDeadline: future(90),
    technicalSpecs: {
      "Модуль": "4",
      "Число зубьев": "28",
      "Материал": "20ХН3А",
      "ТО": "Цементация 0.8-1.2 мм, HRC 58-62",
    },
    status: "approved",
    customerId: "CMP-00041",
    coordinatorNotes: "Все проверки пройдены, качественное описание",
    rejectionReason: "",
    contactViolations: 0,
    createdAt: ago(10),
    updatedAt: ago(2),
    publishedAt: null,
    checks: REQUIRED_CHECKS.map(c => ({
      ...c,
      result: "pass" as const,
      comment: null,
      checkedAt: ago(3),
    })),
    modelUrl: "/models/model 1.glb",
  },
  {
    id: "LOT-2026-0005",
    number: "LOT-2026-0005",
    title: "Крепёж высокопрочный — набор М16-М24",
    description: "Болты высокопрочные кл. 10.9 по ГОСТ Р 52644-2006. М16, М20, М24. Оцинковка горячая.",
    category: "material",
    quantity: 5000,
    unit: "шт",
    budget: 420_000,
    currency: "RUB",
    deliveryAddress: "г. Самара, пр-т Кирова, 100",
    deliveryDeadline: future(20),
    technicalSpecs: {
      "ГОСТ": "Р 52644-2006",
      "Класс прочности": "10.9",
      "Размеры": "М16, М20, М24",
      "Покрытие": "Горячее цинкование",
    },
    status: "published",
    customerId: "CMP-00055",
    coordinatorNotes: "",
    rejectionReason: "",
    contactViolations: 0,
    createdAt: ago(15),
    updatedAt: ago(7),
    publishedAt: ago(7),
    checks: REQUIRED_CHECKS.map(c => ({
      ...c,
      result: "pass" as const,
      comment: null,
      checkedAt: ago(8),
    })),
  },
  {
    id: "LOT-2026-0006",
    number: "LOT-2026-0006",
    title: "Плита подштамповая 800×600×120",
    description: "Изготовление подштамповой плиты. Материал: сталь 45. Фрезеровка, шлифовка, термообработка. Пишите на pochta@zakazchik.ru",
    category: "material",
    quantity: 4,
    unit: "шт",
    budget: 340_000,
    currency: "RUB",
    deliveryAddress: "г. Челябинск, ул. Металлургов, 7",
    deliveryDeadline: future(35),
    technicalSpecs: {
      "Материал": "Сталь 45",
      "Размеры": "800×600×120 мм",
      "Обработка": "Фрезеровка + шлифовка",
      "ТО": "Нормализация",
    },
    status: "rejected",
    customerId: "CMP-00063",
    coordinatorNotes: "Контактный email в описании, заказчик отказался убрать",
    rejectionReason: "Нарушение правил площадки: контактная информация в описании лота. Повторное нарушение.",
    contactViolations: 2,
    createdAt: ago(8),
    updatedAt: ago(3),
    publishedAt: null,
    checks: REQUIRED_CHECKS.map((c, i) => ({
      ...c,
      result: i === 6 ? "fail" as const : "pass" as const,
      comment: i === 6 ? "Email в описании — повторное нарушение" : null,
      checkedAt: ago(4),
    })),
  },
];
