"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = __importDefault(require("../controllers/student/studentController"));
const messageController_1 = __importDefault(require("../controllers/messages/messageController"));
const auth_1 = __importDefault(require("../config/auth-validate/auth"));
const verifyJWT_1 = require("../config/auth-validate/verifyJWT");
const verifyCreateTeam_1 = require("../config/auth-validate/verifyCreateTeam");
const teamController_1 = __importDefault(require("../controllers/school_team/teamController"));
class SchoolTeamRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/signin', auth_1.default.signin);
        this.router.post('/newteam-member', verifyCreateTeam_1.verifyJWTCreateTeam, teamController_1.default.create);
        this.router.post('/student', verifyJWT_1.verifyJWT, studentController_1.default.create);
        this.router.put('/student/:id', verifyJWT_1.verifyJWT, studentController_1.default.update);
        this.router.get('/student/all', verifyJWT_1.verifyJWT, studentController_1.default.getAll);
        this.router.get('/student/perfil', verifyJWT_1.verifyJWT, studentController_1.default.seePerfilByEmail);
        this.router.get('/student/:id', verifyJWT_1.verifyJWT, studentController_1.default.getById);
        this.router.delete('/student/:id', verifyJWT_1.verifyJWT, studentController_1.default.del);
        this.router.post('/message', verifyJWT_1.verifyJWT, messageController_1.default.create);
        this.router.get('/message', verifyJWT_1.verifyJWT, messageController_1.default.see);
        this.router.get('/classes', verifyJWT_1.verifyJWT, studentController_1.default.getClasses);
        this.router.post('/classes', verifyJWT_1.verifyJWT, studentController_1.default.createClass);
    }
}
exports.default = new SchoolTeamRoutes().router;
