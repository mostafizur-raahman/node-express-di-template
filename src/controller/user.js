const { OK } = require("http-status");

class UserController {
    async create(req, res, next) {
        try {
            const _doc = await req.container
                .resolve("createUser")
                .execute(req.body);

            return res.status(OK).send({
                message: "User create succesfully",
                data: _doc,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
