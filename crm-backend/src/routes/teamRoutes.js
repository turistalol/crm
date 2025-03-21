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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController = __importStar(require("../controllers/teamController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.authenticate);
// Get teams for the current user
router.get('/user', teamController.getUserTeams);
// Routes for company teams (protected by role)
router.get('/company', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN, client_1.Role.MANAGER]), teamController.getCompanyTeams);
router.post('/', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN, client_1.Role.MANAGER]), teamController.createTeam);
// Individual team routes
router.get('/:teamId', teamController.getTeam);
router.put('/:teamId', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN, client_1.Role.MANAGER]), teamController.updateTeam);
router.delete('/:teamId', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN]), teamController.deleteTeam);
// Team member management
router.post('/:teamId/members', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN, client_1.Role.MANAGER]), teamController.addTeamMember);
router.delete('/:teamId/members/:userId', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN, client_1.Role.MANAGER]), teamController.removeTeamMember);
router.put('/:teamId/members/:userId/role', (0, roleMiddleware_1.checkRole)([client_1.Role.ADMIN]), teamController.updateTeamMemberRole);
exports.default = router;
