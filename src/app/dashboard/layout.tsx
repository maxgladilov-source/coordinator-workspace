"use client";

import "@ant-design/v5-patch-for-react-19";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConfigProvider, theme as antTheme, App, Tag, Modal } from "antd";
import { ProLayout } from "@ant-design/pro-components";
import type { MenuDataItem } from "@ant-design/pro-components";
import {
  DashboardOutlined,
  FileSearchOutlined,
  ShoppingCartOutlined,
  MessageOutlined,
  AuditOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FolderOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import ruRU from "antd/locale/ru_RU";
import { RoleProvider } from "@/contexts/RoleContext";

function HeaderClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <span className="header-info" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, opacity: 0.7, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
      <ClockCircleOutlined />
      {now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      <span style={{ opacity: 0.4 }}>|</span>
      {now.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [demoRole, setDemoRole] = useState<"admin" | "user">("admin");

  useEffect(() => {
    setMounted(true);
    setDark(localStorage.getItem("theme") === "dark");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    return () => {
      root.classList.remove("dark");
    };
  }, [dark, mounted]);

  const basePath = "/dashboard";

  const menuData: MenuDataItem[] = [
    {
      path: basePath,
      name: "Обзор",
      icon: <DashboardOutlined />,
    },
    {
      path: `${basePath}/lots`,
      name: "Проверка лотов",
      icon: <FileSearchOutlined />,
    },
    {
      path: `${basePath}/orders`,
      name: "Заказы",
      icon: <ShoppingCartOutlined />,
    },
    {
      path: `${basePath}/messages`,
      name: "Мессенджер",
      icon: <MessageOutlined />,
    },
    {
      path: `${basePath}/disputes`,
      name: "Споры",
      icon: <AuditOutlined />,
    },
    {
      path: `${basePath}/calendar`,
      name: "Календарь",
      icon: <CalendarOutlined />,
    },
    {
      path: `${basePath}/documents`,
      name: "Документы",
      icon: <FolderOutlined />,
    },
    {
      path: `${basePath}/analytics`,
      name: "Аналитика",
      icon: <BarChartOutlined />,
    },
    {
      path: `${basePath}/users`,
      name: "Пользователи",
      icon: <TeamOutlined />,
    },
    {
      path: `${basePath}/settings`,
      name: "Настройки",
      icon: <SettingOutlined />,
    },
  ];

  if (!mounted) return null;

  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 8,
        },
      }}
    >
      <App>
        <ProLayout
          title={"Рабочее пространство координатора"}
          logo={false}
          headerTitleRender={() => (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                className="header-logo"
                src={dark ? "/zakazhi-logo-dark.svg" : "/zakazhi-logo.png"}
                alt="Logo"
                style={{ height: 32, width: "auto", flexShrink: 0 }}
              />
              <span className="header-title-text" style={{ fontSize: 28, fontWeight: 600, whiteSpace: "nowrap" }}>Рабочее пространство координатора</span>
            </div>
          )}
          layout="mix"
          fixSiderbar
          fixedHeader
          breadcrumbRender={false}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          location={{ pathname }}
          selectedKeys={[pathname]}
          route={{ path: basePath, routes: menuData }}
          menuItemRender={(item, dom) => (
            <a
              onClick={(e) => {
                e.preventDefault();
                if (item.path) router.push(item.path);
              }}
              href={item.path}
            >
              {dom}
            </a>
          )}
          actionsRender={() => [
            <span key="connection" className="header-info" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, whiteSpace: "nowrap" }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#52c41a",
                display: "inline-block",
                animation: "pulse-dot 1.5s ease-in-out infinite",
              }} />
              <span style={{ color: "#52c41a", fontWeight: 500 }}>Демо</span>
            </span>,
            <span key="demo-role" style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 14 }}>
              <button
                onClick={() => setDemoRole("admin")}
                style={{
                  padding: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  color: demoRole === "admin" ? "#1677ff" : (dark ? "#555" : "#bbb"),
                }}
              >
                Admin
              </button>
              <span style={{ color: dark ? "#555" : "#bbb" }}>/</span>
              <button
                onClick={() => setDemoRole("user")}
                style={{
                  padding: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  color: demoRole === "user" ? "#1677ff" : (dark ? "#555" : "#bbb"),
                }}
              >
                User
              </button>
            </span>,
            <HeaderClock key="clock" />,
            <Tag key="level" icon={<SafetyCertificateOutlined />} color="geekblue">
              Координатор
            </Tag>,
            <button
              key="theme"
              onClick={() => setDark((d) => !d)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                color: "inherit",
              }}
              aria-label={dark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
            >
              {dark ? <SunOutlined /> : <MoonOutlined />}
            </button>,
            <button
              key="signout"
              onClick={() => setSignOutOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                color: "inherit",
              }}
              aria-label="Выйти"
            >
              <LogoutOutlined />
            </button>,
          ]}
          token={{
            sider: {
              colorMenuBackground: dark ? "#141414" : "#fff",
              colorBgMenuItemSelected: dark ? "#383838" : undefined,
              colorBgMenuItemHover: dark ? "#303030" : undefined,
            },
            header: {
              colorBgHeader: dark ? "#141414" : "#fff",
              colorBgRightActionsItemHover: "transparent",
            },
          }}
        >
          <RoleProvider role={demoRole}>
            {children}
          </RoleProvider>
          <Modal
            title="Выход"
            open={signOutOpen}
            onOk={() => router.push("/")}
            onCancel={() => setSignOutOpen(false)}
            okText="Выйти"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
            styles={{
              content: dark ? { backgroundColor: "#383838" } : undefined,
              header: dark ? { backgroundColor: "#383838" } : undefined,
            }}
          >
            <p>Вы уверены, что хотите выйти из системы?</p>
          </Modal>
        </ProLayout>
      </App>
    </ConfigProvider>
  );
}
