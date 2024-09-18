const { Router } = require("express");

const userRoutes = require("./user");

const routes = () => {
    const router = new Router();

    router.use("/v1/user", userRoutes());

    return router;
};

module.exports = routes;
