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
const Messages_1 = __importDefault(require("../config/database/mongooseModels/Messages"));
const pgConnection_1 = __importDefault(require("../config/database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
class MessageController {
    send(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { whoWillReceive, message } = req.body;
            if (!whoWillReceive || !message)
                return res.status(400).send('Set who will receive and the message');
            const requesterUser_name = req.token.payload.user_name;
            const findUser_name = (yield pgConnection_1.default.query(queries_1.default.getUserName, [whoWillReceive])).rows[0];
            if (!findUser_name)
                return res.status(404).send();
            const verifyIfIsTeam = (yield pgConnection_1.default.query(queries_1.default.verifyIfIsTeam, [whoWillReceive])).rows[0];
            const friends = (yield pgConnection_1.default.query(queries_1.default.verifyFriends, [requesterUser_name, whoWillReceive])).rows[0];
            if (!verifyIfIsTeam && !friends)
                return res.status(400).send("You are not friends. Send a friend request first.");
            const newMessage = {
                profile: whoWillReceive,
                whoSent: requesterUser_name,
                message: message
            };
            yield Messages_1.default.create(newMessage);
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
