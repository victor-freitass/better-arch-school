import mongoose from "mongoose";

const MessagesSchema = new mongoose.Schema({
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

const Message = mongoose.model('Messages', MessagesSchema);

export default Message;