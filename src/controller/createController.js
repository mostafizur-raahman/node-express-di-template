const path = require("path");
const fs = require("fs");

module.exports = (controller) => {
    try {
        const controllersPath = __dirname; // Since you are already in the 'controllers' folder
        const controllerFile =
            path.extname(controller) === ".js"
                ? controller
                : `${controller}.js`;
        const controllerPath = path.resolve(controllersPath, controllerFile);

        // Check if the controller file exists
        if (!fs.existsSync(controllerPath)) {
            throw new Error(
                `Controller file "${controllerFile}" does not exist at path: ${controllerPath}`
            );
        }

        // Dynamically import and instantiate the controller
        const ControllerInstance = require(controllerPath);
        return new ControllerInstance();
    } catch (error) {
        console.error(
            `Error creating controller "${controller}":`,
            error.message
        );
        throw error;
    }
};
