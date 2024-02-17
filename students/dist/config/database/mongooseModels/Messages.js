"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessagesSchema = new mongoose_1.default.Schema({
    profile: {
        type: String,
        required: true
    },
    whoSent: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    received_in: {
        type: Date,
        default: Date.now
    }
});
const Message = mongoose_1.default.model('Messages', MessagesSchema);
exports.default = Message;
