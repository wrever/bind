import type { Address, KeelRoles, Role } from "./types";

export const DEFAULT_ROLES: KeelRoles = {
  admin: "ops_admin",
  pauser: "ops_pauser",
  recoverer: "ops_recoverer",
  freezer: "ops_freezer",
};

export function migrateRoles(roles?: Partial<KeelRoles> | null): KeelRoles {
  return {
    ...DEFAULT_ROLES,
    ...(roles ?? {}),
  };
}

/** Admin may act as any role; otherwise exact role holder. */
export function hasRole(roles: KeelRoles, actor: Address, role: Role): boolean {
  if (!actor) return false;
  if (actor === roles.admin) return true;
  return actor === roles[role];
}

export function requireRole(
  roles: KeelRoles,
  actor: Address,
  role: Role,
): void {
  if (!hasRole(roles, actor, role)) {
    throw new Error(`Unauthorized: requires ${role} (or admin)`);
  }
}
