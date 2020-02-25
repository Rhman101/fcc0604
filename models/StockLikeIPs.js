const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StockLikeIPsSchema = new Schema({
    name: {
        type: String,
        required: true, 
        unique: true
    },
    likeIPs: {
        type: [String],
        required: true
    }
})

let StockLikeIPs = new mongoose.model('StockLikeIPs', StockLikeIPsSchema)

module.exports = StockLikeIPs;