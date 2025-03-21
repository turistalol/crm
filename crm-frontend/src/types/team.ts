import { User } from './user';

export enum TeamRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
}

export interface CreateTeamInvitationDto {
  email: string;
  role: TeamRole;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  invitations?: TeamInvitation[];
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  leaderId?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface AddTeamMemberDto {
  userId: string;
  role?: TeamRole;
} 