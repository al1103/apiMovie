const mongoose = require("mongoose");



const CategorySchema = new mongoose.Schema({
    group: {
        id: String,
        name: String
    },
    list: [{
        id: String,
        name: String
    }]
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;

