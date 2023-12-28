import mongoose from "mongoose";

const InfosSchema = new mongoose.Schema({
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

const Message = mongoose.model('Infos', InfosSchema);

export default Message;