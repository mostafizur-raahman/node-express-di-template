const { Router } = require("express");
const createController = require("../controllers/createController");

module.exports = () => {
    const router = new Router();
    const controller = createController("User");
    console.debug("Controller ", controller);
    router.post("/create", controller.create);

    return router;
};
