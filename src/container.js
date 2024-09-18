const { createContainer, Lifetime, asClass, asValue } = require("awilix");
const { scopePerRequest } = require("awilix-express");

const Fault = require("../shared/Fault");
const models = require("../src/models");
const container = createContainer();
const DB = require("../shared/Database");
const Server = require("./server");
const config = require("../config");

container.register({
    config: asValue(config),
    Fault: asValue(Fault),
    models: asValue(models),
    DB: asValue(DB),
    server: asClass(Server).singleton(),
});

container.loadModules(
    [
        "application/**/*.js",
        "controllers/*.js",
        "repositories/*.js",
        "models/*.js",
        "shared/*.js",
    ],
    {
        formatName: "camelCase",
        resolverOptions: {
            lifetime: Lifetime.SINGLETON,
        },
        cwd: __dirname,
    }
);

container.register({
    containerMiddleware: asValue(scopePerRequest(container)),
});

console.debug("Loaded Modules:");
console.debug(container.registrations);

module.exports = container;
