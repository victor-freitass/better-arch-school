import { Router } from "express";
import StudentController from "./student/studentController";
import Signin from './config/auth-validate/auth';
import { verifyJWT } from "./config/auth-validate/verifyJWT";
import MessageController from "./message/messageController";
import FriendsController from "./friends/friendsController";
import PhotosController from "./photos/photosController";

class Routes {
    router: Router

    constructor () {
        this.router = Router();
        this.routes();
    }

    routes () {
        this.router.post('/signin', Signin.signin);

        this.router.get('/student', verifyJWT, StudentController.getStudentAllInfos);
        this.router.get('/perfil', verifyJWT, StudentController.seePerfilByUser_name);

        this.router.get('/friends', verifyJWT, FriendsController.getAllFriends);
        this.router.get('/friends/requests', verifyJWT, FriendsController.getAllRequests);
        this.router.post('/friends', verifyJWT, FriendsController.sendFriendRequest);
        this.router.post('/friends/accept', verifyJWT, FriendsController.acceptRequest);

        this.router.post('/message', verifyJWT, MessageController.send);
        this.router.get('/message', verifyJWT, MessageController.see);

        this.router.get('/photos', verifyJWT, PhotosController.getAll);
        this.router.post('/photos', verifyJWT, PhotosController.create);
        this.router.delete('/photos/:id', verifyJWT, PhotosController.deleteById);
        this.router.put('/profilePhoto', verifyJWT, PhotosController.updateProfilePhoto);
    }
}

export default new Routes().router