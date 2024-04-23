const mongoose = require('mongoose')

const GroupMessageSchema = mongoose.Schema(
    {
        from_user: {
            type: String,
            required: true
        },
        room: {
            type: String,
            required: true,
        }, 
        message: {
            type: String,
            required: true,
            default: '<EMPTY>'
        },
        date_sent: {
            type: Date,
            default: Date.now
        }
        
    }
)
// pre middleware - date sent
GroupMessageSchema.pre('save', (next) => {
    if(!this.date_sent){
        this.date_sent = Date.now()
    }
    next()
})

module.exports = mongoose.model("GroupMessage", GroupMessageSchema);