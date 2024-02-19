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
const pgConnection_1 = __importDefault(require("../../config/database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validators_1 = require("../../config/validators");
class SchoolTeamController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('.');
            const { user_name, office, profile_photo, email, password } = req.body;
            try {
                const token = req.token;
                const officeValidate = token !== 'BOSS' ?
                    token.payload.office : 'director';
                if (officeValidate === 'teacher') {
                    return res.status(401).send('Teachers are not allowed to insert someone. Just directors and coordinators');
                }
                if (!user_name || !office || !profile_photo || !email || !password) {
                    return res.status(400).send('Set all infos');
                }
                if (office !== 'teacher' && office !== 'director' && office !== 'coordinator') {
                    return res.status(400).send("Values Allowed: 'teacher' or 'coordinator' or 'director'");
                }
                const [checkEmail1, checkEmail2, checkUserName1, checkUserName2] = yield Promise.all([
                    (yield pgConnection_1.default.query(queries_1.default.getEmailFromDB, [email])).rows[0],
                    (yield pgConnection_1.default.query(queries_1.default.getEmailFromSocialMediaDB, [email])).rows[0],
                    (yield pgConnection_1.default.query(queries_1.default.getUser_nameFromDB, [user_name])).rows[0],
                    (yield pgConnection_1.default.query(queries_1.default.getUser_nameFromSocialMEdiaDB, [user_name])).rows[0]
                ]);
                if (checkEmail1 || checkEmail2 || checkUserName1 || checkUserName2)
                    return res.status(400).send('Email or user name already exists');
                if (!(0, validators_1.emailValidator)(email))
                    return res.status(400).send('Invalid email');
                try {
                    yield (0, validators_1.imgurValidate)(profile_photo);
                }
                catch (msg) {
                    return res.status(400).send(msg);
                }
                const salt = bcrypt_1.default.genSaltSync(10);
                const passEncrypted = bcrypt_1.default.hashSync(password, salt);
                yield pgConnection_1.default.query(queries_1.default.insert, [user_name, office, profile_photo, email, passEncrypted]);
            }
            catch (err) {
                console.log(err);
                return res.status(500).send('Sorry, Internal Server Error');
            }
            return res.status(201).send();
        });
    }
}
exports.default = new SchoolTeamController();
