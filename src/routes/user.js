const { Router } = require("express");
const createController = require("../controller/createController");

module.exports = () => {
    const router = new Router();

    router.post("/create", createController("User").create);

    return router;
};
