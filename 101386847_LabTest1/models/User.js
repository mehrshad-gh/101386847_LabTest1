const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        firstname: {
            type: String,
            required: true,
            trim: true
        },
        lastname: {
            type: String,
            required: true,
            trim: true
        },
        createon: {
            type: Date,
            default: Date.now
        }
    }
)

// pre middleware - date created 
UserSchema.pre('save', (next) => {
    if(!this.createon){
        this.createon = Date.now()
    }
    next()
})

module.exports = mongoose.model("User", UserSchema);