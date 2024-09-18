const { Router } = require("express");

const userRoutes = require("./user");

const routes = () => {
    const router = new Router();

    console.debug("User route calling....");

    router.use("/v1/user", userRoutes());

    return router;
};

module.exports = routes;
