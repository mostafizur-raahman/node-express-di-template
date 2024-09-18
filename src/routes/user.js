const { Router } = require("express");
// const createController = require("../controllers/createController");
const UserController = require("../controllers/User");
module.exports = () => {
    const router = new Router();
    // const controller = createController("User");
    const userController = new UserController();
    // console.debug("controller ", controller);

    router.post("/create", userController.create.bind(userController));

    return router;
};
