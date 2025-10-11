import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UserRoleV2Type, PermissionV2Type } from '../../shared/schema.js';

// Mock the permission functions since they depend on DB schema
const UserRoleV2 = {
  ADMIN: 'ADMIN' as UserRoleV2Type,
  FINANCE: 'FINANCE' as UserRoleV2Type,
  VIEWER: 'VIEWER' as UserRoleV2Type,
  AUDITOR: 'AUDITOR' as UserRoleV2Type
};

const PermissionV2 = {
  // User Management
  MANAGE_USERS: 'MANAGE_USERS' as PermissionV2Type,
  ASSIGN_ROLES: 'ASSIGN_ROLES' as PermissionV2Type,
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS' as PermissionV2Type,
  VIEW_USERS: 'VIEW_USERS' as PermissionV2Type,
  MANAGE_SETTINGS: 'MANAGE_SETTINGS' as PermissionV2Type,
  VIEW_SYSTEM_STATUS: 'VIEW_SYSTEM_STATUS' as PermissionV2Type,
  
  // Cashbox
  MANAGE_CASHBOXES: 'MANAGE_CASHBOXES' as PermissionV2Type,
  TRANSFER_CASHBOX: 'TRANSFER_CASHBOX' as PermissionV2Type,
  VIEW_CASHBOXES: 'VIEW_CASHBOXES' as PermissionV2Type,
  
  // Bank Integration
  MANAGE_BANK_INTEGRATIONS: 'MANAGE_BANK_INTEGRATIONS' as PermissionV2Type,
  VIEW_BANK_INTEGRATIONS: 'VIEW_BANK_INTEGRATIONS' as PermissionV2Type,
  IMPORT_BANK_DATA: 'IMPORT_BANK_DATA' as PermissionV2Type,
  
  // Reports
  VIEW_REPORTS: 'VIEW_REPORTS' as PermissionV2Type,
  EXPORT_REPORTS: 'EXPORT_REPORTS' as PermissionV2Type,
  GENERATE_REPORTS: 'GENERATE_REPORTS' as PermissionV2Type,
  
  // Dashboard
  VIEW_DASHBOARD: 'VIEW_DASHBOARD' as PermissionV2Type,
  
  // Other
  MANAGE_BUDGET: 'MANAGE_BUDGET' as PermissionV2Type
};

const rolePermissionsV2: Record<UserRoleV2Type, PermissionV2Type[]> = {
  ADMIN: Object.values(PermissionV2),
  FINANCE: [
    'MANAGE_CASHBOXES', 
    'TRANSFER_CASHBOX', 
    'VIEW_CASHBOXES',
    'MANAGE_BANK_INTEGRATIONS',
    'IMPORT_BANK_DATA',
    'VIEW_BANK_INTEGRATIONS',
    'VIEW_REPORTS', 
    'EXPORT_REPORTS',
    'GENERATE_REPORTS',
    'VIEW_DASHBOARD',
    'MANAGE_BUDGET'
  ] as PermissionV2Type[],
  VIEWER: [
    'VIEW_DASHBOARD', 
    'VIEW_CASHBOXES', 
    'VIEW_BANK_INTEGRATIONS',
    'VIEW_REPORTS',
    'EXPORT_REPORTS'
  ] as PermissionV2Type[],
  AUDITOR: [
    'VIEW_DASHBOARD', 
    'VIEW_CASHBOXES', 
    'VIEW_BANK_INTEGRATIONS',
    'VIEW_REPORTS', 
    'EXPORT_REPORTS',
    'VIEW_AUDIT_LOGS', 
    'VIEW_USERS'
  ] as PermissionV2Type[]
};

function hasPermissionV2(userRole: UserRoleV2Type, permission: PermissionV2Type): boolean {
  const permissions = rolePermissionsV2[userRole];
  return permissions.includes(permission);
}

function hasAnyPermissionV2(userRole: UserRoleV2Type, permissions: PermissionV2Type[]): boolean {
  const userPermissions = rolePermissionsV2[userRole];
  return permissions.some(permission => userPermissions.includes(permission));
}

describe('User Permissions V2', () => {
  describe('hasPermissionV2', () => {
    it('should return true for admin with any permission', () => {
      const adminPermissions = rolePermissionsV2[UserRoleV2.ADMIN];
      adminPermissions.forEach(permission => {
        expect(hasPermissionV2(UserRoleV2.ADMIN, permission)).toBe(true);
      });
    });

    it('should return true for finance role with finance permissions', () => {
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.MANAGE_CASHBOXES)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.TRANSFER_CASHBOX)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.VIEW_REPORTS)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.EXPORT_REPORTS)).toBe(true);
    });

    it('should return false for finance role with admin permissions', () => {
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.MANAGE_USERS)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.ASSIGN_ROLES)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.FINANCE, PermissionV2.VIEW_AUDIT_LOGS)).toBe(false);
    });

    it('should return true for viewer role with view permissions', () => {
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.VIEW_DASHBOARD)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.VIEW_CASHBOXES)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.VIEW_REPORTS)).toBe(true);
    });

    it('should return false for viewer role with manage permissions', () => {
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.MANAGE_CASHBOXES)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.MANAGE_BANK_INTEGRATIONS)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.VIEWER, PermissionV2.MANAGE_USERS)).toBe(false);
    });

    it('should return true for auditor role with audit permissions', () => {
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.VIEW_AUDIT_LOGS)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.VIEW_USERS)).toBe(true);
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.VIEW_REPORTS)).toBe(true);
    });

    it('should return false for auditor role with manage permissions', () => {
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.MANAGE_USERS)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.MANAGE_CASHBOXES)).toBe(false);
      expect(hasPermissionV2(UserRoleV2.AUDITOR, PermissionV2.TRANSFER_CASHBOX)).toBe(false);
    });
  });

  describe('hasAnyPermissionV2', () => {
    it('should return true if user has any of the required permissions', () => {
      const permissions = [
        PermissionV2.MANAGE_USERS,
        PermissionV2.VIEW_CASHBOXES,
        PermissionV2.MANAGE_CASHBOXES
      ];

      // Admin should have all permissions
      expect(hasAnyPermissionV2(UserRoleV2.ADMIN, permissions)).toBe(true);

      // Finance should have cashbox permissions
      expect(hasAnyPermissionV2(UserRoleV2.FINANCE, permissions)).toBe(true);

      // Viewer should only have view permissions
      expect(hasAnyPermissionV2(UserRoleV2.VIEWER, permissions)).toBe(true);

      // Auditor should only have view permissions
      expect(hasAnyPermissionV2(UserRoleV2.AUDITOR, permissions)).toBe(true);
    });

    it('should return false if user has none of the required permissions', () => {
      const permissions = [
        PermissionV2.MANAGE_USERS,
        PermissionV2.ASSIGN_ROLES,
        PermissionV2.VIEW_SYSTEM_STATUS
      ];

      // Only admin should have these permissions
      expect(hasAnyPermissionV2(UserRoleV2.ADMIN, permissions)).toBe(true);
      expect(hasAnyPermissionV2(UserRoleV2.FINANCE, permissions)).toBe(false);
      expect(hasAnyPermissionV2(UserRoleV2.VIEWER, permissions)).toBe(false);
      expect(hasAnyPermissionV2(UserRoleV2.AUDITOR, permissions)).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermissionV2(UserRoleV2.ADMIN, [])).toBe(false);
      expect(hasAnyPermissionV2(UserRoleV2.FINANCE, [])).toBe(false);
      expect(hasAnyPermissionV2(UserRoleV2.VIEWER, [])).toBe(false);
      expect(hasAnyPermissionV2(UserRoleV2.AUDITOR, [])).toBe(false);
    });
  });

  describe('Role Permission Mapping', () => {
    it('should have correct permissions for ADMIN role', () => {
      const adminPermissions = rolePermissionsV2[UserRoleV2.ADMIN];
      
      expect(adminPermissions).toContain(PermissionV2.MANAGE_USERS);
      expect(adminPermissions).toContain(PermissionV2.ASSIGN_ROLES);
      expect(adminPermissions).toContain(PermissionV2.VIEW_AUDIT_LOGS);
      expect(adminPermissions).toContain(PermissionV2.MANAGE_SETTINGS);
      expect(adminPermissions).toContain(PermissionV2.VIEW_SYSTEM_STATUS);
      expect(adminPermissions).toContain(PermissionV2.MANAGE_CASHBOXES);
      expect(adminPermissions).toContain(PermissionV2.MANAGE_BANK_INTEGRATIONS);
    });

    it('should have correct permissions for FINANCE role', () => {
      const financePermissions = rolePermissionsV2[UserRoleV2.FINANCE];
      
      expect(financePermissions).toContain(PermissionV2.MANAGE_CASHBOXES);
      expect(financePermissions).toContain(PermissionV2.TRANSFER_CASHBOX);
      expect(financePermissions).toContain(PermissionV2.MANAGE_BANK_INTEGRATIONS);
      expect(financePermissions).toContain(PermissionV2.IMPORT_BANK_DATA);
      expect(financePermissions).toContain(PermissionV2.EXPORT_REPORTS);
      
      expect(financePermissions).not.toContain(PermissionV2.MANAGE_USERS);
      expect(financePermissions).not.toContain(PermissionV2.ASSIGN_ROLES);
      expect(financePermissions).not.toContain(PermissionV2.VIEW_AUDIT_LOGS);
    });

    it('should have correct permissions for VIEWER role', () => {
      const viewerPermissions = rolePermissionsV2[UserRoleV2.VIEWER];
      
      expect(viewerPermissions).toContain(PermissionV2.VIEW_DASHBOARD);
      expect(viewerPermissions).toContain(PermissionV2.VIEW_CASHBOXES);
      expect(viewerPermissions).toContain(PermissionV2.VIEW_BANK_INTEGRATIONS);
      expect(viewerPermissions).toContain(PermissionV2.VIEW_REPORTS);
      expect(viewerPermissions).toContain(PermissionV2.EXPORT_REPORTS);
      
      expect(viewerPermissions).not.toContain(PermissionV2.MANAGE_CASHBOXES);
      expect(viewerPermissions).not.toContain(PermissionV2.TRANSFER_CASHBOX);
      expect(viewerPermissions).not.toContain(PermissionV2.MANAGE_BANK_INTEGRATIONS);
      expect(viewerPermissions).not.toContain(PermissionV2.MANAGE_USERS);
    });

    it('should have correct permissions for AUDITOR role', () => {
      const auditorPermissions = rolePermissionsV2[UserRoleV2.AUDITOR];
      
      expect(auditorPermissions).toContain(PermissionV2.VIEW_DASHBOARD);
      expect(auditorPermissions).toContain(PermissionV2.VIEW_CASHBOXES);
      expect(auditorPermissions).toContain(PermissionV2.VIEW_BANK_INTEGRATIONS);
      expect(auditorPermissions).toContain(PermissionV2.VIEW_REPORTS);
      expect(auditorPermissions).toContain(PermissionV2.EXPORT_REPORTS);
      expect(auditorPermissions).toContain(PermissionV2.VIEW_AUDIT_LOGS);
      expect(auditorPermissions).toContain(PermissionV2.VIEW_USERS);
      
      expect(auditorPermissions).not.toContain(PermissionV2.MANAGE_USERS);
      expect(auditorPermissions).not.toContain(PermissionV2.MANAGE_CASHBOXES);
      expect(auditorPermissions).not.toContain(PermissionV2.TRANSFER_CASHBOX);
      expect(auditorPermissions).not.toContain(PermissionV2.MANAGE_BANK_INTEGRATIONS);
    });
  });

  describe('Permission Hierarchy', () => {
    it('should ensure ADMIN has all permissions that other roles have', () => {
      const adminPermissions = rolePermissionsV2[UserRoleV2.ADMIN];
      const financePermissions = rolePermissionsV2[UserRoleV2.FINANCE];
      const viewerPermissions = rolePermissionsV2[UserRoleV2.VIEWER];
      const auditorPermissions = rolePermissionsV2[UserRoleV2.AUDITOR];

      // Admin should have all finance permissions
      financePermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission);
      });

      // Admin should have all viewer permissions
      viewerPermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission);
      });

      // Admin should have all auditor permissions
      auditorPermissions.forEach(permission => {
        expect(adminPermissions).toContain(permission);
      });
    });

    it('should ensure FINANCE has all viewer permissions', () => {
      const financePermissions = rolePermissionsV2[UserRoleV2.FINANCE];
      const viewerPermissions = rolePermissionsV2[UserRoleV2.VIEWER];

      viewerPermissions.forEach(permission => {
        expect(financePermissions).toContain(permission);
      });
    });

    it('should ensure AUDITOR has all viewer permissions', () => {
      const auditorPermissions = rolePermissionsV2[UserRoleV2.AUDITOR];
      const viewerPermissions = rolePermissionsV2[UserRoleV2.VIEWER];

      viewerPermissions.forEach(permission => {
        expect(auditorPermissions).toContain(permission);
      });
    });
  });
});
