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

    async seePerfilByUser_name (req: Request, res: Response) {
        const thisStudent = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { user_name } = req.body;

        const friends = (await client.query(queries.verifyFriends, [thisStudent, user_name])).rows[0];
        const verifyIfIsTeam = (await client.query(queries.verifyIfIsTeam, [user_name])).rows[0];

        if (!verifyIfIsTeam && !friends) return res.status(400).send("You are not friends. Send a friend request first.");

        if (friends) {
            const studentPerfil = (await client.query(queries.getStudentPerfil, [user_name])).rows[0];
            return res.json(studentPerfil)
        } else if (verifyIfIsTeam) {
            const teamPerfil = (await client.query(queries.getTeamPerfil, [user_name])).rows[0];
            return res.json(teamPerfil)
        }

        return res.status(404).send('Not found');
    }
}

export default new StudentController();