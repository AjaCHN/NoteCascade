// app/lib/permissions.ts v1.0.0

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest';

export interface Permissions {
  canManageUsers: boolean;
  canEditSongs: boolean;
  canDeleteSongs: boolean;
  canAccessAdminPanel: boolean;
  canUploadMidi: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    canManageUsers: true,
    canEditSongs: true,
    canDeleteSongs: true,
    canAccessAdminPanel: true,
    canUploadMidi: true,
  },
  moderator: {
    canManageUsers: false,
    canEditSongs: true,
    canDeleteSongs: false,
    canAccessAdminPanel: true,
    canUploadMidi: true,
  },
  user: {
    canManageUsers: false,
    canEditSongs: false,
    canDeleteSongs: false,
    canAccessAdminPanel: false,
    canUploadMidi: true,
  },
  guest: {
    canManageUsers: false,
    canEditSongs: false,
    canDeleteSongs: false,
    canAccessAdminPanel: false,
    canUploadMidi: false,
  },
};

export function getPermissions(role: UserRole = 'guest'): Permissions {
  return ROLE_PERMISSIONS[role];
}
