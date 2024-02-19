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
const Messages_1 = __importDefault(require("../../config/database/mongoose/models/Messages"));
const pgConnection_1 = __importDefault(require("../../config/database/pgConnection"));
class MessageController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser_name = req.token.payload.user_name;
            const { whoWillReceive, message } = req.body;
            if (!whoWillReceive || !message)
                return res.status(400).send('Set who will receive and the message');
            const [findStudent, findTeam] = yield Promise.all([
                pgConnection_1.default.query('SELECT * FROM student_social_media WHERE user_name = $1', [whoWillReceive]),
                pgConnection_1.default.query('SELECT * FROM school_team WHERE user_name = $1', [whoWillReceive]),
            ]);
            if (!findStudent.rows[0] && !findTeam.rows[0])
                return res.status(404).send();
            const newMessage = {
                profile: whoWillReceive,
                whoSent: requesterUser_name,
                message: message
            };
            let error = false;
            yield Messages_1.default.create(newMessage).then(() => error = error).catch(err => {
                error = true;
                console.log(err);
            });
            if (error)
                return res.status(500).send('Sorry, Internal Server Error');
            return res.status(201).send();
        });
    }
    see(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = req.token.payload.user_name;
            let seeMessages = [];
            (yield Messages_1.default.find({ profile: profile })).forEach((m, i) => {
                seeMessages[i] = { whoSent: m.whoSent, message: m.message, received_in: m.received_in.toString() };
            });
            return res.json({ seeMessages });
        });
    }
}
exports.default = new MessageController();
