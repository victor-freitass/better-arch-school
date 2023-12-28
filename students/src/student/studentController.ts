import { Request, Response } from "express";
import client from "../config/database/pgConnection";
import queries from "./queries";
import { CustomRequest } from "../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";

class StudentController {
    async getStudentAllInfos (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;

        const studentId = (await client.query(queries.getStudentId, [user_name])).rows[0].id;

        const student = (await client.query(queries.getStudent, [studentId])).rows[0];
        return res.json(student);
    }
}

export default new StudentController();