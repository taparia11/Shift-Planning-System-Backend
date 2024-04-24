const mongoose = require('mongoose');
const { Schema } = mongoose;

const AvailabilitySchema = new Schema({

user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
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

tag:{
    type: String,
    default: 'General'
},

date:{
    type: Date,
    default:Date.now
}

});

module.exports = mongoose.model('availability', AvailabilitySchema)