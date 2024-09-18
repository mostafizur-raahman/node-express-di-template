class CreateUser {
    constructor({ userRepository, Fault }) {
        this.userRepository = userRepository;
        this.Fault = Fault;
    }

    async execute(data) {
        const newUser = await this.userRepository.create(data);

        return newUser;
    }
}

module.exports = CreateUser;
