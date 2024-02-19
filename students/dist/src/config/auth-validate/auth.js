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
const pgConnection_1 = __importDefault(require("../database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AUTHSECRET = process.env.AUTHSECRET;
class Signin {
    signin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password)
                return res.status(400).send('Insert email and password');
            const studentFromDB = (yield pgConnection_1.default.query(queries_1.default.getStudent, [email])).rows[0];
            if (!studentFromDB)
                return res.status(400).send('Not founded');
            if (!bcrypt_1.default.compareSync(password, studentFromDB.password)) {
                return res.status(401).send(`Incorrect Password. Are you ${studentFromDB.user_name}?`);
            }
            const payload = {
                email: studentFromDB.email,
                student: true,
                user_name: studentFromDB.user_name
            };
            const token = jsonwebtoken_1.default.sign({ payload }, AUTHSECRET, { expiresIn: '1d' });
            return res.json(token);
        });
    }
}
exports.default = new Signin();
