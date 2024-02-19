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
const pgConnection_1 = __importDefault(require("../config/database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
class StudentController {
    getStudentAllInfos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_name = req.token.payload.user_name;
            const studentId = (yield pgConnection_1.default.query(queries_1.default.getStudentId, [user_name])).rows[0].id;
            const student = (yield pgConnection_1.default.query(queries_1.default.getStudent, [studentId])).rows[0];
            return res.json(student);
        });
    }
    seePerfilByUser_name(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const thisStudent = req.token.payload.user_name;
            const { user_name } = req.body;
            const friends = (yield pgConnection_1.default.query(queries_1.default.verifyFriends, [thisStudent, user_name])).rows[0];
            const verifyIfIsTeam = (yield pgConnection_1.default.query(queries_1.default.verifyIfIsTeam, [user_name])).rows[0];
            if (!verifyIfIsTeam && !friends)
                return res.status(400).send("You are not friends. Send a friend request first.");
            if (friends) {
                const studentPerfil = (yield pgConnection_1.default.query(queries_1.default.getStudentPerfil, [user_name])).rows[0];
                return res.json(studentPerfil);
            }
            else if (verifyIfIsTeam) {
                const teamPerfil = (yield pgConnection_1.default.query(queries_1.default.getTeamPerfil, [user_name])).rows[0];
                return res.json(teamPerfil);
            }
            return res.status(404).send('Not found');
        });
    }
}
exports.default = new StudentController();
