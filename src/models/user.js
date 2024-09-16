const { mongo, default: mongoose } = require("mongoose");
const { generateModel } = require("./baseModel");

module.exports = generateModel({
    modelName: "User",
    schema: {
        name: String,
        email: String,
        password: String,
    },
});
