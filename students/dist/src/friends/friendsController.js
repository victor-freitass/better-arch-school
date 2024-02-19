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
class FriendsController {
    sendFriendRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser_name = req.token.payload.user_name;
            const { user_name: user_nameToRequestFriend } = req.body;
            if (!user_nameToRequestFriend)
                return res.status(400).send('Set user_name to friend request');
            const checkIfExists = (yield pgConnection_1.default.query(queries_1.default.checkIfExists, [user_nameToRequestFriend])).rows[0];
            if (!checkIfExists)
                return res.status(404).send();
            const alreadyAreFriends = (yield pgConnection_1.default.query(queries_1.default.checkAlreadyFriends, [requesterUser_name, user_nameToRequestFriend])).rows[0];
            if (alreadyAreFriends)
                return res.status(400).send('You are already friends');
            let block = 0;
            const iAlreadyDidRequestBefore = (yield pgConnection_1.default.query(queries_1.default.getFriendRequests, [user_nameToRequestFriend])).rows;
            if (iAlreadyDidRequestBefore[0].friend_requests) {
                iAlreadyDidRequestBefore[0].friend_requests.forEach((request) => {
                    if (request === requesterUser_name)
                        block = 1;
                });
            }
            const heAlreadyMadeBefore = (yield pgConnection_1.default.query(queries_1.default.getFriendRequests, [requesterUser_name])).rows;
            if (heAlreadyMadeBefore[0].friend_requests) {
                heAlreadyMadeBefore[0].friend_requests.forEach((request) => {
                    if (request === user_nameToRequestFriend)
                        block = 2;
                });
            }
            if (block === 1)
                return res.status(400).send('Have you made this request before');
            if (block === 2)
                return res.status(400).send('He made the request to you before. Check your friend requests and accept.');
            yield pgConnection_1.default.query(queries_1.default.sendFriendRequest, [user_nameToRequestFriend, requesterUser_name]);
            return res.status(201).send(`Request send to ${user_nameToRequestFriend}!`);
        });
    }
    getAllRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser_name = req.token.payload.user_name;
            const requests = (yield pgConnection_1.default.query(queries_1.default.getFriendRequests, [requesterUser_name])).rows;
            return res.json(requests[0].friend_requests);
        });
    }
    getAllFriends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser_name = req.token.payload.user_name;
            const friends = (yield pgConnection_1.default.query(queries_1.default.getAll, [requesterUser_name])).rows;
            let justTheFriends = [];
            friends.forEach(f => {
                if (f.student_one === requesterUser_name) {
                    justTheFriends.push(f.student_two);
                }
                else {
                    justTheFriends.push(f.student_one);
                }
            });
            return res.json({ friends: justTheFriends });
        });
    }
    acceptRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const requesterUser_name = req.token.payload.user_name;
            const { user_nameToRequestAccept } = req.body;
            const requests = (yield pgConnection_1.default.query(queries_1.default.getFriendRequests, [requesterUser_name])).rows[0].friend_requests;
            let thisReqExists = false;
            if (requests) {
                requests.forEach((user_name) => __awaiter(this, void 0, void 0, function* () {
                    if (user_name === user_nameToRequestAccept) {
                        thisReqExists = true;
                        yield pgConnection_1.default.query(queries_1.default.removeRequest, [requesterUser_name, user_nameToRequestAccept]);
                        yield pgConnection_1.default.query(queries_1.default.insert, [user_nameToRequestAccept, requesterUser_name]);
                    }
                }));
            }
            else {
                return res.status(400).send('No one pending request for you');
            }
            if (!thisReqExists)
                return res.status(404).send('This friend request not exists');
            return res.status(201).send('Request accepted');
        });
    }
}
exports.default = new FriendsController();
