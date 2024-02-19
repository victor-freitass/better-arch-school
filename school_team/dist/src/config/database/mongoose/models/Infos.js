"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const InfosSchema = new mongoose_1.default.Schema({
    classes: [{
            type: {
                name: String,
                studentCount: Number,
                average: Number
            }
        }],
    studentCount: {
        type: Number
    },
    schoolTeamCount: {
        type: Number
    },
    phoneNumber: {
        type: Number,
        required: true
    }
});
const Message = mongoose_1.default.model('Infos', InfosSchema);
exports.default = Message;
