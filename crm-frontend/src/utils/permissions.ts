// Define all system roles in order of privilege (higher index = more privileges)
export const ROLES = {
  USER: 'USER',
  AGENT: 'AGENT',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

// Role hierarchy (higher index means more permissions)
export const ROLE_LEVELS = {
  [ROLES.USER]: 0,
  [ROLES.AGENT]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.ADMIN]: 3,
};

// Define permissions for various system actions
export const PERMISSIONS = {
  VIEW_DASHBOARD: [ROLES.USER, ROLES.AGENT, ROLES.MANAGER, ROLES.ADMIN],
  MANAGE_LEADS: [ROLES.AGENT, ROLES.MANAGER, ROLES.ADMIN],
  VIEW_REPORTS: [ROLES.AGENT, ROLES.MANAGER, ROLES.ADMIN],
  MANAGE_TEAMS: [ROLES.MANAGER, ROLES.ADMIN],
  MANAGE_COMPANY: [ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  ACCESS_SETTINGS: [ROLES.ADMIN],
};

/**
 * Check if a user with a specific role has permission to perform an action
 * @param userRole The role of the user
 * @param requiredPermission The permission to check
 * @returns boolean indicating if the user has permission
 */
export const hasPermission = (
  userRole: string | undefined, 
  requiredPermission: string[]
): boolean => {
  if (!userRole) return false;
  
  // If no specific permission is required, allow access
  if (requiredPermission.length === 0) return true;
  
  // Direct role check
  if (requiredPermission.includes(userRole)) return true;
  
  // Role hierarchy check
  const userRoleLevel = ROLE_LEVELS[userRole as keyof typeof ROLE_LEVELS] || -1;
  
  // Check if any of the required roles have a level that's less than or equal to the user's role level
  return requiredPermission.some(role => {
    const requiredRoleLevel = ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] || Infinity;
    return userRoleLevel >= requiredRoleLevel;
  });
};

/**
 * Check if a user has access to a specific feature
 * @param userRole The role of the user
 * @param feature The feature to check access for
 * @returns boolean indicating if the user has access
 */
export const hasFeatureAccess = (
  userRole: string | undefined,
  feature: keyof typeof PERMISSIONS
): boolean => {
  if (!userRole) return false;
  
  const requiredRoles = PERMISSIONS[feature];
  return hasPermission(userRole, requiredRoles);
}; 