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
const imgurValidate_1 = __importDefault(require("../config/imgurValidate"));
const pgConnection_1 = __importDefault(require("../config/database/pgConnection"));
const queries_1 = __importDefault(require("./queries"));
class PhotoController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_name = req.token.payload.user_name;
            const { url } = req.body;
            if (!url)
                return res.status(400).send('Set a url from imgur');
            try {
                yield (0, imgurValidate_1.default)(url);
            }
            catch (msg) {
                return res.status(400).send(msg);
            }
            try {
                const verifyUrl = (yield pgConnection_1.default.query(queries_1.default.getPhotoAlreadyExists, [user_name, url])).rows[0];
                if (verifyUrl)
                    return res.status(400).send('Duplicate photos are not allowed');
                yield pgConnection_1.default.query(queries_1.default.insert, [url, user_name]);
            }
            catch (e) {
                console.log(e);
                return res.status(500).send();
            }
            return res.status(201).send('Photo published successfully!');
        });
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_name = req.token.payload.user_name;
            const allPhotos = (yield pgConnection_1.default.query(queries_1.default.getAll, [user_name])).rows;
            return res.json(allPhotos);
        });
    }
    deleteById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_name = req.token.payload.user_name;
            const { id } = req.params;
            if (Number.isNaN(Number(id)))
                return res.status(400).send('Only numbers are allowed');
            const delResponse = (yield pgConnection_1.default.query(queries_1.default.delete, [id, user_name])).rows[0];
            if (!delResponse)
                return res.status(404).send();
            return res.status(204).send();
        });
    }
    updateProfilePhoto(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user_name = req.token.payload.user_name;
            const { url } = req.body;
            try {
                yield (0, imgurValidate_1.default)(url);
            }
            catch (msg) {
                return res.status(400).send(msg);
            }
            const upResponse = (yield pgConnection_1.default.query(queries_1.default.updateProfile, [url, user_name])).rows[0];
            if (!upResponse)
                return res.status(404).send();
            return res.status(204).send('Profile photo updated successfully');
        });
    }
}
exports.default = new PhotoController();
