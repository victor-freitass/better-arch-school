"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studentController_1 = __importDefault(require("./student/studentController"));
const auth_1 = __importDefault(require("./config/auth-validate/auth"));
const verifyJWT_1 = require("./config/auth-validate/verifyJWT");
const messageController_1 = __importDefault(require("./message/messageController"));
const friendsController_1 = __importDefault(require("./friends/friendsController"));
const photosController_1 = __importDefault(require("./photos/photosController"));
class Routes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        this.router.post('/signin', auth_1.default.signin);
        this.router.get('/student', verifyJWT_1.verifyJWT, studentController_1.default.getStudentAllInfos);
        this.router.get('/perfil', verifyJWT_1.verifyJWT, studentController_1.default.seePerfilByUser_name);
        this.router.get('/friends', verifyJWT_1.verifyJWT, friendsController_1.default.getAllFriends);
        this.router.get('/friends/requests', verifyJWT_1.verifyJWT, friendsController_1.default.getAllRequests);
        this.router.post('/friends', verifyJWT_1.verifyJWT, friendsController_1.default.sendFriendRequest);
        this.router.post('/friends/accept', verifyJWT_1.verifyJWT, friendsController_1.default.acceptRequest);
        this.router.post('/message', verifyJWT_1.verifyJWT, messageController_1.default.send);
        this.router.get('/message', verifyJWT_1.verifyJWT, messageController_1.default.see);
        this.router.get('/photos', verifyJWT_1.verifyJWT, photosController_1.default.getAll);
        this.router.get('/photos/user', verifyJWT_1.verifyJWT, photosController_1.default.getUserPhotos);
        this.router.post('/photos', verifyJWT_1.verifyJWT, photosController_1.default.create);
        this.router.delete('/photos/:id', verifyJWT_1.verifyJWT, photosController_1.default.deleteById);
        this.router.put('/profilePhoto', verifyJWT_1.verifyJWT, photosController_1.default.updateProfilePhoto);
    }
}
exports.default = new Routes().router;
