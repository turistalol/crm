import prisma from '../utils/database';

// Enums for team roles
export enum TeamRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

// Data transfer objects
interface CreateTeamDto {
  name: string;
  description?: string;
  companyId: string;
  leaderId?: string;
}

interface UpdateTeamDto {
  name?: string;
  description?: string;
}

interface AddTeamMemberDto {
  userId: string;
  teamId: string;
  role?: TeamRole;
}

// Team services
export async function createTeam(data: CreateTeamDto) {
  const { name, description, companyId, leaderId } = data;
  
  // Create transaction to ensure both team and leader are created
  return prisma.$transaction(async (tx) => {
    // Create the team
    const team = await tx.team.create({
      data: {
        name,
        description,
        companyId,
      }
    });
    
    // If a leader is specified, add them to the team
    if (leaderId) {
      await tx.teamMember.create({
        data: {
          userId: leaderId,
          teamId: team.id,
          role: TeamRole.LEADER
        }
      });
    }
    
    return team;
  });
}

export async function getTeamById(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: { 
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      }
    }
  });
}

export async function getTeamsByCompany(companyId: string) {
  return prisma.team.findMany({
    where: { companyId },
    include: { 
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }
  });
}

export async function updateTeam(teamId: string, data: UpdateTeamDto) {
  return prisma.team.update({
    where: { id: teamId },
    data
  });
}

export async function deleteTeam(teamId: string) {
  return prisma.team.delete({
    where: { id: teamId }
  });
}

export async function addTeamMember(data: AddTeamMemberDto) {
  const { userId, teamId, role = TeamRole.MEMBER } = data;
  
  return prisma.teamMember.create({
    data: {
      userId,
      teamId,
      role
    }
  });
}

export async function removeTeamMember(userId: string, teamId: string) {
  return prisma.teamMember.delete({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    }
  });
}

export async function updateTeamMemberRole(userId: string, teamId: string, role: TeamRole) {
  return prisma.teamMember.update({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    },
    data: { role }
  });
}

export async function getTeamsByUser(userId: string) {
  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true
    }
  });
  
  return teamMembers.map(member => member.team);
} 