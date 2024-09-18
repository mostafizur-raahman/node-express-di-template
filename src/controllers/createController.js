const path = require("path");

module.exports = (controller) => {
    const controllersPath = path.resolve(__dirname, "..", "controllers");
    const controllerPath = path.resolve(
        controllersPath,
        path.extname(controller) === ".js" ? controller : `${controller}.js`
    );

    try {
        const ControllerInstance = require(`${controllerPath}`);

        const Controller = new ControllerInstance();

        return Controller;
    } catch (error) {
        console.log("Controller creation error: ", error);
    }
};
