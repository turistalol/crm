export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 