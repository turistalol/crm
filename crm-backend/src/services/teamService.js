"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRole = void 0;
exports.createTeam = createTeam;
exports.getTeamById = getTeamById;
exports.getTeamsByCompany = getTeamsByCompany;
exports.updateTeam = updateTeam;
exports.deleteTeam = deleteTeam;
exports.addTeamMember = addTeamMember;
exports.removeTeamMember = removeTeamMember;
exports.updateTeamMemberRole = updateTeamMemberRole;
exports.getTeamsByUser = getTeamsByUser;
const database_1 = __importDefault(require("../utils/database"));
// Enums for team roles
var TeamRole;
(function (TeamRole) {
    TeamRole["LEADER"] = "LEADER";
    TeamRole["MEMBER"] = "MEMBER";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
// Team services
function createTeam(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, description, companyId, leaderId } = data;
        // Create transaction to ensure both team and leader are created
        return database_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            // Create the team
            const team = yield tx.team.create({
                data: {
                    name,
                    description,
                    companyId,
                }
            });
            // If a leader is specified, add them to the team
            if (leaderId) {
                yield tx.teamMember.create({
                    data: {
                        userId: leaderId,
                        teamId: team.id,
                        role: TeamRole.LEADER
                    }
                });
            }
            return team;
        }));
    });
}
function getTeamById(teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.team.findUnique({
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
    });
}
function getTeamsByCompany(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.team.findMany({
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
    });
}
function updateTeam(teamId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.team.update({
            where: { id: teamId },
            data
        });
    });
}
function deleteTeam(teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.team.delete({
            where: { id: teamId }
        });
    });
}
function addTeamMember(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, teamId, role = TeamRole.MEMBER } = data;
        return database_1.default.teamMember.create({
            data: {
                userId,
                teamId,
                role
            }
        });
    });
}
function removeTeamMember(userId, teamId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.teamMember.delete({
            where: {
                userId_teamId: {
                    userId,
                    teamId
                }
            }
        });
    });
}
function updateTeamMemberRole(userId, teamId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.default.teamMember.update({
            where: {
                userId_teamId: {
                    userId,
                    teamId
                }
            },
            data: { role }
        });
    });
}
function getTeamsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamMembers = yield database_1.default.teamMember.findMany({
            where: { userId },
            include: {
                team: true
            }
        });
        return teamMembers.map(member => member.team);
    });
}
