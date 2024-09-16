const mongoose = require("mongoose");
const config = require("../config");

class Database {
    static async connect() {
        try {
            await mongoose.connect(config.MONGO_URI);

            console.log("MongoDB connected");
        } catch (err) {
            console.error("MongoDB connection error:", err);
        }

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB error:", err);
        });
    }
}

module.exports = Database;
