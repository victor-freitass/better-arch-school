import mongoose from "mongoose";

const MessagesSchema = new mongoose.Schema({
    profile: { //dono do perfil q está recebendo a mensagem.
        type: String,
        required: true
    },
    whoSent: {//de quem enviou
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