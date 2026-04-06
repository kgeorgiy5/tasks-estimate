export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
