export type DemoRole = "admin" | "user";

/**
 * Ключи разрешений координатора.
 *
 * admin — полный доступ (старший координатор)
 * user  — просмотр + базовые действия (координатор-стажёр)
 */
export type Permission =
  /* Обзор */
  | "viewDashboard"
  /* Лоты */
  | "viewLots"
  | "checkLot"
  | "approveLot"
  | "rejectLot"
  | "publishLot"
  /* Заказы */
  | "viewOrders"
  | "changeOrderStatus"
  | "openDispute"
  /* Сообщения */
  | "viewMessages"
  | "sendMessage"
  | "viewFilteredOriginals"
  /* Споры */
  | "viewDisputes"
  | "mediateDispute"
  | "escalateDispute"
  /* Документы */
  | "viewDocuments"
  | "uploadDocument"
  /* Аналитика */
  | "viewAnalytics"
  /* Календарь */
  | "viewCalendar"
  /* Пользователи */
  | "viewUsers"
  | "manageUsers"
  /* Настройки */
  | "viewSettings"
  | "editSettings";

const adminPermissions: Permission[] = [
  "viewDashboard",
  "viewLots",
  "checkLot",
  "approveLot",
  "rejectLot",
  "publishLot",
  "viewOrders",
  "changeOrderStatus",
  "openDispute",
  "viewMessages",
  "sendMessage",
  "viewFilteredOriginals",
  "viewDisputes",
  "mediateDispute",
  "escalateDispute",
  "viewDocuments",
  "uploadDocument",
  "viewAnalytics",
  "viewCalendar",
  "viewUsers",
  "manageUsers",
  "viewSettings",
  "editSettings",
];

const userPermissions: Permission[] = [
  "viewDashboard",
  "viewLots",
  "checkLot",
  "viewOrders",
  "viewMessages",
  "sendMessage",
  "viewDisputes",
  "viewDocuments",
  "viewCalendar",
  "viewUsers",
  "viewSettings",
];

const permissionsByRole: Record<DemoRole, ReadonlySet<Permission>> = {
  admin: new Set(adminPermissions),
  user: new Set(userPermissions),
};

export function can(role: DemoRole, permission: Permission): boolean {
  return permissionsByRole[role].has(permission);
}
