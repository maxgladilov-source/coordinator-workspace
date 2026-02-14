"use client";

import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "@/contexts/RoleContext";
import { PageContainer } from "@ant-design/pro-components";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Statistic,
  Modal,
  Form,
  Switch,
  Typography,
  Space,
  Popconfirm,
  Avatar,
  App,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  SendOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  AuditOutlined,
  ToolOutlined,
  CrownOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CoordinatorRole = "coordinator" | "supervisor" | "admin" | "engineer" | "manager";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  telegram: string;
  role: CoordinatorRole;
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
  lotsReviewed: number;
  ordersManaged: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const initialMembers: TeamMember[] = [
  {
    id: "cm-1",
    name: "Смирнова Ольга Андреевна",
    email: "smirnova@everypart.pro",
    telegram: "@smirnova_oa",
    role: "admin",
    active: true,
    lastLogin: "2026-02-15 09:05",
    createdAt: "2025-01-10",
    lotsReviewed: 342,
    ordersManaged: 128,
  },
  {
    id: "cm-2",
    name: "Карпов Михаил Сергеевич",
    email: "karpov@everypart.pro",
    telegram: "@karpov_ms",
    role: "supervisor",
    active: true,
    lastLogin: "2026-02-15 08:30",
    createdAt: "2025-02-15",
    lotsReviewed: 215,
    ordersManaged: 87,
  },
  {
    id: "cm-3",
    name: "Егорова Анна Петровна",
    email: "egorova@everypart.pro",
    telegram: "@egorova_ap",
    role: "coordinator",
    active: true,
    lastLogin: "2026-02-14 17:42",
    createdAt: "2025-04-20",
    lotsReviewed: 156,
    ordersManaged: 45,
  },
  {
    id: "cm-4",
    name: "Волков Илья Дмитриевич",
    email: "volkov@everypart.pro",
    telegram: "@volkov_id",
    role: "engineer",
    active: true,
    lastLogin: "2026-02-14 16:10",
    createdAt: "2025-06-01",
    lotsReviewed: 98,
    ordersManaged: 22,
  },
  {
    id: "cm-5",
    name: "Тихонова Екатерина Васильевна",
    email: "tikhonova@everypart.pro",
    telegram: "@tikhonova_ev",
    role: "coordinator",
    active: true,
    lastLogin: "2026-02-13 11:30",
    createdAt: "2025-07-15",
    lotsReviewed: 73,
    ordersManaged: 18,
  },
  {
    id: "cm-6",
    name: "Морозов Артём Игоревич",
    email: "morozov@everypart.pro",
    telegram: "",
    role: "manager",
    active: true,
    lastLogin: "2026-02-12 14:20",
    createdAt: "2025-08-01",
    lotsReviewed: 0,
    ordersManaged: 64,
  },
  {
    id: "cm-7",
    name: "Лебедева Дарья Олеговна",
    email: "lebedeva@everypart.pro",
    telegram: "@lebedeva_do",
    role: "coordinator",
    active: false,
    lastLogin: "2026-01-20 09:15",
    createdAt: "2025-09-10",
    lotsReviewed: 41,
    ordersManaged: 12,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const roleConfig: Record<CoordinatorRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { label: "Администратор", color: "red", icon: <CrownOutlined /> },
  supervisor: { label: "Супервайзер", color: "purple", icon: <SafetyCertificateOutlined /> },
  coordinator: { label: "Координатор", color: "blue", icon: <UserOutlined /> },
  engineer: { label: "Инженер", color: "orange", icon: <ToolOutlined /> },
  manager: { label: "Менеджер", color: "green", icon: <AuditOutlined /> },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UsersPage() {
  const { can } = usePermissions();
  const { message } = App.useApp();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | CoordinatorRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form] = Form.useForm();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setDark(root.classList.contains("dark"));
    const obs = new MutationObserver(() => setDark(root.classList.contains("dark")));
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (statusFilter === "active" && !m.active) return false;
      if (statusFilter === "inactive" && m.active) return false;
      if (search) {
        const q = search.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [members, roleFilter, statusFilter, search]);

  const totalActive = members.filter((m) => m.active).length;
  const coordinatorCount = members.filter((m) => m.role === "coordinator" && m.active).length;
  const supervisorCount = members.filter((m) => (m.role === "supervisor" || m.role === "admin") && m.active).length;
  const engineerCount = members.filter((m) => m.role === "engineer" && m.active).length;
  const managerCount = members.filter((m) => m.role === "manager" && m.active).length;

  function openAddModal() {
    setEditingMember(null);
    form.resetFields();
    form.setFieldsValue({ role: "coordinator", active: true });
    setModalOpen(true);
  }

  function openEditModal(member: TeamMember) {
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      email: member.email,
      telegram: member.telegram,
      role: member.role,
      active: member.active,
    });
    setModalOpen(true);
  }

  function handleModalOk() {
    form.validateFields().then((values) => {
      if (editingMember) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editingMember.id
              ? { ...m, name: values.name, email: values.email, telegram: values.telegram || "", role: values.role, active: values.active }
              : m
          )
        );
        message.success("Сотрудник обновлён");
      } else {
        const newMember: TeamMember = {
          id: `cm-${Date.now()}`,
          name: values.name,
          email: values.email,
          telegram: values.telegram || "",
          role: values.role,
          active: values.active,
          lastLogin: null,
          createdAt: new Date().toISOString().slice(0, 10),
          lotsReviewed: 0,
          ordersManaged: 0,
        };
        setMembers((prev) => [...prev, newMember]);
        message.success("Сотрудник добавлен");
      }
      setModalOpen(false);
    });
  }

  function handleDelete(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    message.success("Сотрудник удалён");
  }

  function handleToggleActive(id: string, active: boolean) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active } : m))
    );
    message.success(active ? "Сотрудник активирован" : "Сотрудник деактивирован");
  }

  const columns: ColumnsType<TeamMember> = [
    {
      title: "Сотрудник",
      key: "user",
      render: (_, record) => {
        const rc = roleConfig[record.role];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar
              size={36}
              style={{
                backgroundColor: record.active
                  ? (record.role === "admin" ? "#f5222d" : record.role === "supervisor" ? "#722ed1" : record.role === "engineer" ? "#fa8c16" : record.role === "manager" ? "#52c41a" : "#1677ff")
                  : "#d9d9d9",
                flexShrink: 0,
              }}
            >
              {record.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      width: 180,
      render: (role: CoordinatorRole) => {
        const rc = roleConfig[role];
        return <Tag icon={rc.icon} color={rc.color}>{rc.label}</Tag>;
      },
    },
    {
      title: "Лотов проверено",
      dataIndex: "lotsReviewed",
      key: "lotsReviewed",
      width: 130,
      sorter: (a, b) => a.lotsReviewed - b.lotsReviewed,
      render: (val: number) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{val}</Text>,
    },
    {
      title: "Заказов",
      dataIndex: "ordersManaged",
      key: "ordersManaged",
      width: 100,
      sorter: (a, b) => a.ordersManaged - b.ordersManaged,
      render: (val: number) => <Text style={{ fontSize: 13, fontWeight: 500 }}>{val}</Text>,
    },
    {
      title: "Статус",
      dataIndex: "active",
      key: "active",
      width: 110,
      render: (active: boolean, record) =>
        can("manageUsers") ? (
          <Switch
            checked={active}
            checkedChildren="Актив."
            unCheckedChildren="Откл."
            onChange={(checked) => handleToggleActive(record.id, checked)}
            size="small"
          />
        ) : (
          <Tag color={active ? "green" : "default"}>{active ? "Активен" : "Отключён"}</Tag>
        ),
    },
    {
      title: "Последний вход",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 160,
      render: (val: string | null) =>
        val ? <Text style={{ fontSize: 12 }}>{val}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>Никогда</Text>,
    },
    ...(can("manageUsers")
      ? [{
          title: "" as string,
          key: "actions" as string,
          width: 90,
          render: (_: unknown, record: TeamMember) => (
            <Space size={4}>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
              <Popconfirm
                title="Удалить сотрудника?"
                description="Сотрудник потеряет доступ к системе координации."
                onConfirm={() => handleDelete(record.id)}
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          ),
        }]
      : []) as ColumnsType<TeamMember>,
  ];

  return (
    <PageContainer title="Команда координаторов" subTitle="Управление сотрудниками и их ролями">
      {/* Stats */}
      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <Statistic
            title="Всего сотрудников"
            value={`${totalActive}/${members.length}`}
            prefix={<TeamOutlined style={{ color: "#1677ff" }} />}
            valueStyle={{ fontSize: 22 }}
          />
          <Statistic
            title="Координаторы"
            value={coordinatorCount}
            prefix={<UserOutlined style={{ color: "#1677ff" }} />}
            valueStyle={{ fontSize: 22, color: "#1677ff" }}
          />
          <Statistic
            title="Супервайзеры / Админы"
            value={supervisorCount}
            prefix={<SafetyCertificateOutlined style={{ color: "#722ed1" }} />}
            valueStyle={{ fontSize: 22, color: "#722ed1" }}
          />
          <Statistic
            title="Инженеры"
            value={engineerCount}
            prefix={<ToolOutlined style={{ color: "#fa8c16" }} />}
            valueStyle={{ fontSize: 22, color: "#fa8c16" }}
          />
          <Statistic
            title="Менеджеры"
            value={managerCount}
            prefix={<AuditOutlined style={{ color: "#52c41a" }} />}
            valueStyle={{ fontSize: 22, color: "#52c41a" }}
          />
        </div>
      </Card>

      {/* Filters */}
      <Card size="small" style={{ borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Input
            placeholder="Поиск по имени или email..."
            prefix={<SearchOutlined />}
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 200 }}
            options={[
              { value: "all", label: "Все роли" },
              { value: "admin", label: "Администратор" },
              { value: "supervisor", label: "Супервайзер" },
              { value: "coordinator", label: "Координатор" },
              { value: "engineer", label: "Инженер" },
              { value: "manager", label: "Менеджер" },
            ]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: "all", label: "Все статусы" },
              { value: "active", label: "Активные" },
              { value: "inactive", label: "Неактивные" },
            ]}
          />
          <div style={{ flex: 1 }} />
          {can("manageUsers") && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
              Добавить
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: "Нет сотрудников, соответствующих фильтрам" }}
        />
      </Card>

      {/* Add/Edit Modal */}
      {can("manageUsers") && (
        <Modal
          title={editingMember ? "Редактировать сотрудника" : "Добавить сотрудника"}
          open={modalOpen}
          onOk={handleModalOk}
          onCancel={() => setModalOpen(false)}
          okText={editingMember ? "Сохранить" : "Добавить"}
          cancelText="Отмена"
          width={460}
          destroyOnHidden
          styles={{
            content: dark ? { backgroundColor: "#383838" } : undefined,
            header: dark ? { backgroundColor: "#383838" } : undefined,
          }}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="name"
              label="ФИО"
              rules={[{ required: true, message: "Введите имя сотрудника" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Например, Иванов Алексей Сергеевич" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Введите email" },
                { type: "email", message: "Введите корректный email" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="user@everypart.pro" />
            </Form.Item>
            <Form.Item name="telegram" label="Telegram">
              <Input prefix={<SendOutlined style={{ color: "#229ED9" }} />} placeholder="@username" />
            </Form.Item>
            <Form.Item
              name="role"
              label="Роль"
              rules={[{ required: true, message: "Выберите роль" }]}
            >
              <Select
                options={[
                  { value: "admin", label: "Администратор — полный доступ, управление командой" },
                  { value: "supervisor", label: "Супервайзер — проверка, одобрение, публикация" },
                  { value: "coordinator", label: "Координатор — проверка лотов, сообщения" },
                  { value: "engineer", label: "Инженер — техническая экспертиза лотов" },
                  { value: "manager", label: "Менеджер — сопровождение заказов" },
                ]}
              />
            </Form.Item>
            <Form.Item name="active" label="Активен" valuePropName="checked">
              <Switch checkedChildren="Актив." unCheckedChildren="Откл." />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </PageContainer>
  );
}
