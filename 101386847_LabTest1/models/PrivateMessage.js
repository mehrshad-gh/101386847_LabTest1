const mongoose = require('mongoose')

const PrivateMessageSchema = mongoose.Schema(
    {
        from_user: {
            type: String,
            required: true
        },
        to_user: {
            type: String,
            required: true
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
PrivateMessageSchema.pre('save', (next) => {
    if(!this.date_sent){
        this.date_sent = Date.now()
    }
    next()
})
module.exports = mongoose.model("PrivateMessage", PrivateMessageSchema);