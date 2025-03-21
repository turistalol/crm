"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyTeams = getCompanyTeams;
exports.getTeam = getTeam;
exports.createTeam = createTeam;
exports.updateTeam = updateTeam;
exports.deleteTeam = deleteTeam;
exports.addTeamMember = addTeamMember;
exports.removeTeamMember = removeTeamMember;
exports.updateTeamMemberRole = updateTeamMemberRole;
exports.getUserTeams = getUserTeams;
const teamService = __importStar(require("../services/teamService"));
const logger_1 = require("../utils/logger");
// Get teams for the current user's company
function getCompanyTeams(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user } = req;
            const { companyId } = user;
            if (!companyId) {
                return res.status(400).json({ message: 'User does not belong to a company' });
            }
            const teams = yield teamService.getTeamsByCompany(companyId);
            return res.status(200).json(teams);
        }
        catch (error) {
            logger_1.logger.error('Error getting company teams:', error);
            return res.status(500).json({ message: 'Failed to get teams' });
        }
    });
}
// Get a specific team by ID
function getTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId } = req.params;
            const team = yield teamService.getTeamById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found' });
            }
            return res.status(200).json(team);
        }
        catch (error) {
            logger_1.logger.error('Error getting team:', error);
            return res.status(500).json({ message: 'Failed to get team' });
        }
    });
}
// Create a new team
function createTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user } = req;
            const { name, description, leaderId } = req.body;
            if (!user.companyId) {
                return res.status(400).json({ message: 'User does not belong to a company' });
            }
            const team = yield teamService.createTeam({
                name,
                description,
                companyId: user.companyId,
                leaderId: leaderId || user.id,
            });
            return res.status(201).json(team);
        }
        catch (error) {
            logger_1.logger.error('Error creating team:', error);
            return res.status(500).json({ message: 'Failed to create team' });
        }
    });
}
// Update an existing team
function updateTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId } = req.params;
            const { name, description } = req.body;
            const updatedTeam = yield teamService.updateTeam(teamId, {
                name,
                description,
            });
            return res.status(200).json(updatedTeam);
        }
        catch (error) {
            logger_1.logger.error('Error updating team:', error);
            return res.status(500).json({ message: 'Failed to update team' });
        }
    });
}
// Delete a team
function deleteTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId } = req.params;
            yield teamService.deleteTeam(teamId);
            return res.status(204).send();
        }
        catch (error) {
            logger_1.logger.error('Error deleting team:', error);
            return res.status(500).json({ message: 'Failed to delete team' });
        }
    });
}
// Add a member to a team
function addTeamMember(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId } = req.params;
            const { userId, role } = req.body;
            const teamMember = yield teamService.addTeamMember({
                teamId,
                userId,
                role,
            });
            return res.status(201).json(teamMember);
        }
        catch (error) {
            logger_1.logger.error('Error adding team member:', error);
            return res.status(500).json({ message: 'Failed to add team member' });
        }
    });
}
// Remove a member from a team
function removeTeamMember(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, userId } = req.params;
            yield teamService.removeTeamMember(userId, teamId);
            return res.status(204).send();
        }
        catch (error) {
            logger_1.logger.error('Error removing team member:', error);
            return res.status(500).json({ message: 'Failed to remove team member' });
        }
    });
}
// Update a team member's role
function updateTeamMemberRole(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { teamId, userId } = req.params;
            const { role } = req.body;
            const teamMember = yield teamService.updateTeamMemberRole(userId, teamId, role);
            return res.status(200).json(teamMember);
        }
        catch (error) {
            logger_1.logger.error('Error updating team member role:', error);
            return res.status(500).json({ message: 'Failed to update team member role' });
        }
    });
}
// Get teams for the current user
function getUserTeams(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user } = req;
            const teams = yield teamService.getTeamsByUser(user.id);
            return res.status(200).json(teams);
        }
        catch (error) {
            logger_1.logger.error('Error getting user teams:', error);
            return res.status(500).json({ message: 'Failed to get user teams' });
        }
    });
}
