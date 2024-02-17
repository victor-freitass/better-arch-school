"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authSecret = process.env.AUTHSECRET;
const AUTHSECRET = authSecret;
function verifyJWT(req, res, next) {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
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
exports.verifyJWT = verifyJWT;
