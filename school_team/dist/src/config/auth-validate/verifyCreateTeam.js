"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWTCreateTeam = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authSecret = process.env.AUTHSECRET;
const AUTHSECRET = authSecret;
function verifyJWTCreateTeam(req, res, next) {
    var _a;
    const { boss_password } = req.body;
    //verify boss/owner - initial director
    if (boss_password && boss_password !== process.env.BOSS_PASSWORD) {
        return res.status(401).send('Incorrect boss password');
    }
    else if (boss_password === process.env.BOSS_PASSWORD) {
        req.token = 'BOSS';
        return next();
    }
    let token;
    const auth = (req.headers['auth']); //In Swagger 
    if (typeof auth === "string") {
        token = auth.replace('Bearer ', '');
    }
    else {
        token = ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''));
    }
    let block = false;
    if (!token) {
        return res.status(401).send('Without Token');
    }
    jsonwebtoken_1.default.verify(token, AUTHSECRET, (err, decoded) => {
        if (err)
            block = true;
        req.token = decoded;
    });
    if (block)
        return res.status(401).send("You're not allowed.");
    next();
}
exports.verifyJWTCreateTeam = verifyJWTCreateTeam;
