require("dotenv").config();

module.exports = {
    port: process.env.PORT || 5000,
    mongo_uri: process.env.MONGO_URI || "mongodb://localhost:27017",
};
