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
const axios_1 = __importDefault(require("axios"));
function imgurValidate(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgurHost = new URL('', 'https://i.imgur.com/').hostname;
        const checkUrl = new URL('', url).hostname;
        if (imgurHost !== checkUrl) {
            throw "Only Imgur photos are allowed. Create a photo there if you don't have.";
        }
        const validateImage = yield axios_1.default.get(url)
            .then(res => {
            return res.status;
        }).catch(_ => false);
        if (!validateImage || validateImage === 404) {
            throw 'Insert an existing photo from imgur.com';
        }
        return true;
    });
}
exports.default = imgurValidate;
