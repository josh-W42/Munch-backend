const mongoose = require('mongoose')

// products: array of mongoId's, with ref 'Product'
const categorySchema = new mongoose.Schema({
    name: String, 
}, { timestamps: true }
)

// give a name and a schema mongoose.model() method
const Category =  mongoose.model('Category', categorySchema)

module.exports = Category