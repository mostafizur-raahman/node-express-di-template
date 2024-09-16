const BaseRepository = require("./BaseRepository");

class UserRepository extends BaseRepository {
    constructor({ models }) {
        super(models.User);
    }
}

module.exports = UserRepository;
