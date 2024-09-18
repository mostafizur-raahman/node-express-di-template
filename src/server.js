const cors = require("cors");
const express = require("express");
const routes = require("../src/routes");
const Status = require("http-status");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const path = require("path");
const _http = require("http");
const config = require("../config");

class Server {
    constructor({ config, DB, containerMiddleware }) {
        this.config = config;
        this.DB = DB;
        this.express = express();
        this.express.use(containerMiddleware);
    }

    start() {
        this._setUp();

        return new Promise((resolve) => {
            const server = _http.createServer(this.express);
            const port = this.config.port || 3000;

            const http = server.listen(port, () => {
                const { port } = http.address();
                console.log(
                    ` ${new Date()} \n Template running on port ${port}`
                );
                resolve();
            });
        });
    }

    _setUp() {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: true }));

        const accessLogStream = rfs.createStream("access.log", {
            interval: "1d",
            path: path.join(__dirname, "log"),
        });

        this.express.use(morgan("combined", { stream: accessLogStream }));
        this.express.use(morgan("dev"));

        // routes

        this.express.use("/", routes());

        this.DB.connect();

        // Handle errors
        this.express.use((error, req, res, next) => {
            console.error(error.stack);

            let message = error.message,
                status = Status.INTERNAL_SERVER_ERROR;

            if (error.code === 11000) {
                const value = this.getValueFromMongoDuplicateError(error);

                message = `${value} "already exists."`;
                status = Status.CONFLICT;
            }

            if (error.message === "Invalid date format")
                status = Status.BAD_REQUEST;

            res.status(error.status ? error.status : status).send({
                message: message,
            });
        });
    }

    getValueFromMongoDuplicateError = (error) => {
        const stringPattern = /"([^"]+)"/;
        const numberPattern = /(\w+): (\d+)/;

        let value = null;
        let matches = null;

        if (stringPattern.test(error.message)) {
            matches = error.message.match(stringPattern);
        } else if (numberPattern.test(error.message)) {
            matches = error.message.match(numberPattern);
        }

        if (matches && matches.length > 1) {
            value = matches[1];
        }

        return value;
    };
}

module.exports = Server;
