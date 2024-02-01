import { Router } from "express";
import StudentController from "../controllers/student/studentController";
import MessageController from "../controllers/messages/messageController";
import Signin from '../config/auth-validate/auth';
import { verifyJWT } from "../config/auth-validate/verifyJWT";
import { verifyJWTCreateTeam } from "../config/auth-validate/verifyCreateTeam";
import SchoolTeamController from "../controllers/school_team/teamController";

class SchoolTeamRoutes {
    router: Router

    constructor () {
        this.router = Router();
        this.routes();
    }

    routes () {
        this.router.post('/signin', Signin.signin);

        this.router.post('/newteam-member', verifyJWTCreateTeam, SchoolTeamController.create);

        this.router.post('/student', verifyJWT, StudentController.create);
        this.router.put('/student/:id', verifyJWT, StudentController.update);
        this.router.get('/student/all', verifyJWT, StudentController.getAll);
        this.router.get('/student/perfil', verifyJWT, StudentController.seePerfilByEmail);
        this.router.get('/student/:id', verifyJWT, StudentController.getById);
        this.router.delete('/student/:id', verifyJWT, StudentController.del);

        this.router.post('/message', verifyJWT, MessageController.create);
        this.router.get('/message', verifyJWT, MessageController.see);

        this.router.get('/classes', verifyJWT, StudentController.getClasses);
        this.router.post('/classes', verifyJWT, StudentController.createClass);
    }   
}

export default new SchoolTeamRoutes().router;   