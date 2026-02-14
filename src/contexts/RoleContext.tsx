"use client";

import { createContext, useContext } from "react";
import { type DemoRole, type Permission, can } from "@/lib/permissions";

interface RoleContextValue {
  role: DemoRole;
  can: (permission: Permission) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: "user",
  can: () => false,
});

export function RoleProvider({
  role,
  children,
}: {
  role: DemoRole;
  children: React.ReactNode;
}) {
  return (
    <RoleContext.Provider value={{ role, can: (p) => can(role, p) }}>
      {children}
    </RoleContext.Provider>
  );
}

export function usePermissions() {
  return useContext(RoleContext);
}
