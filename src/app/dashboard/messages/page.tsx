"use client";

import { useState } from "react";
import { PageContainer } from "@ant-design/pro-components";
import { Card, Tag, Typography, Input, Badge, Button } from "antd";
import {
  SendOutlined,
  WarningOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { MOCK_CONVERSATIONS, CHANNEL_CONFIG, CONV_STATUS_CONFIG } from "@/lib/messages-mock-data";
import type { Conversation, Message } from "@/lib/messages-mock-data";

const { Text } = Typography;

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "только что";
  if (hours < 24) return `${hours} ч. назад`;
  return `${Math.floor(hours / 24)} дн. назад`;
}

const ROLE_COLOR: Record<string, string> = {
  coordinator: "#2563eb",
  customer: "#1677ff",
  supplier: "#52c41a",
  system: "#8c8c8c",
};

const ROLE_LABEL: Record<string, string> = {
  coordinator: "Координатор",
  customer: "Заказчик",
  supplier: "Поставщик",
  system: "Система",
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const selected = conversations.find(c => c.id === selectedId) ?? null;

  const handleSend = () => {
    if (!newMessage.trim() || !selected) return;
    const msg: Message = {
      id: `msg-new-${Date.now()}`,
      from: "Координатор",
      fromRole: "coordinator",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      filtered: false,
    };
    setConversations(prev => prev.map(c =>
      c.id === selected.id
        ? { ...c, messages: [...c.messages, msg], lastMessageAt: msg.timestamp }
        : c
    ));
    setNewMessage("");
  };

  return (
    <PageContainer title="Мессенджер" subTitle="Коммуникация с заказчиками и поставщиками">
      <div style={{ display: "flex", gap: 0, height: "calc(100vh - 200px)", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
        {/* Conversations list */}
        <div style={{ width: 340, borderRight: "1px solid #f0f0f0", overflowY: "auto", background: "#fafafa" }}>
          {conversations.map(conv => {
            const chCfg = CHANNEL_CONFIG[conv.channel];
            const stCfg = CONV_STATUS_CONFIG[conv.status];
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  background: selectedId === conv.id ? "#e6f4ff" : "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <Tag color={chCfg.color} style={{ fontSize: 11 }}>{chCfg.label}</Tag>
                  <Badge count={conv.unreadCount} size="small" />
                </div>
                <Text strong style={{ fontSize: 13, display: "block" }}>{conv.subject}</Text>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{conv.participantCompany}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{timeAgo(conv.lastMessageAt)}</Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selected ? (
            <>
              {/* Header */}
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Text strong>{selected.subject}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{selected.participantName} — {selected.participantCompany}</Text>
                </div>
                <Tag color={CONV_STATUS_CONFIG[selected.status].color}>
                  {CONV_STATUS_CONFIG[selected.status].label}
                </Tag>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {selected.messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      maxWidth: "70%",
                      alignSelf: msg.fromRole === "coordinator" ? "flex-end" : "flex-start",
                      background: msg.fromRole === "coordinator" ? "#e6f4ff" : msg.fromRole === "system" ? "#f5f5f5" : "#f6ffed",
                      borderRadius: 8,
                      padding: "8px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 12, color: ROLE_COLOR[msg.fromRole] }}>{msg.from}</Text>
                      <Tag style={{ fontSize: 10 }} color={ROLE_COLOR[msg.fromRole]}>{ROLE_LABEL[msg.fromRole]}</Tag>
                      <Text type="secondary" style={{ fontSize: 10, marginLeft: "auto" }}>
                        {new Date(msg.timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </div>
                    {msg.filtered && (
                      <Tag color="orange" icon={<WarningOutlined />} style={{ marginBottom: 4 }}>
                        Контакт отфильтрован
                      </Tag>
                    )}
                    <Text style={{ fontSize: 14 }}>{msg.text}</Text>
                    {msg.originalText && msg.fromRole !== "coordinator" && (
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ fontSize: 11, color: "#fa8c16", cursor: "pointer" }}>
                          <EyeOutlined /> Показать оригинал
                        </summary>
                        <div style={{ marginTop: 4, padding: "6px 10px", background: "#fff7e6", borderRadius: 4, fontSize: 12 }}>
                          {msg.originalText}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onPressEnter={handleSend}
                  placeholder="Написать сообщение..."
                  style={{ flex: 1 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                  Отправить
                </Button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8c8c8c" }}>
              Выберите диалог
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
