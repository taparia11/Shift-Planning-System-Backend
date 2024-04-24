const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShiftSchema = new Schema({

user:{
    type: mongoose.Schema.Types.ObjectId,
    required:true
},

date:{
    type: Date,
    required: true
},

startTime:{
    type: Date,
    required: true
},

endTime:{
    type: Date,
    required: true
},

creationDate:{
    type: Date,
    default:Date.now
}

});

module.exports = mongoose.model('shifts', ShiftSchema)