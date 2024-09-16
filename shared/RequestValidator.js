const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const addErrors = require("ajv-errors");

class RequestValidator {
    constructor({ Fault }) {
        this.Fault = Fault;

        this.ajv = new Ajv({ allErrors: true });
        this.ajv.addFormat("objectId", "^[0-9a-fA-F]{24}$");
        this.ajv.addFormat("hex", "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
        this.ajv.addFormat("webp", "[^s]+(.*?).(webp|WEBP)$");
        this.ajv.addFormat("phone", /^(?:\+?880|0)1[3-9]\d{8}$/);
        this.ajv.addFormat("email", "^[^s@]+@[^s@]+.[^s@]+$");
        this.ajv.addFormat("port", "^[0-9]{4}$");
        this.ajv.addFormat(
            "password",
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[!@#$%^&*()-_=+{};:,<.>]).{8,}$"
        );
        this.ajv.addFormat(
            "domain",
            "^(?!://)([a-zA-Z0-9-_]+.)*[a-zA-Z0-9][a-zA-Z0-9-_]+.[a-zA-Z]{2,}$"
        );
        this.ajv.addFormat(
            "jwt",
            "^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.[A-Za-z0-9-_.+/=]+$"
        );

        addFormats(this.ajv);
        addErrors(this.ajv);
    }

    /**
     * Checks if an object is empty.
     *
     * @param {Object} data - The object to be checked for emptiness.
     * @returns {boolean} Returns true if the object is empty, false otherwise.
     */
    isObjectEmpty(data) {
        return Object.keys(data).length === 0;
    }

    isValidObjectId(id) {
        if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
            throw new this.Fault("Please provide valid id to operate on.", 400);
        }
    }

    /**
     * Validates data against the provided JSON schema.
     * @param {Object} schema - JSON schema to validate against.
     * @param {Object} data - Data to be validated.
     * @throws {Error} Throws an error if validation fails.
     */
    validate(schema, data) {
        if (this.isObjectEmpty(data)) {
            throw new this.Fault("No data provided.", 400);
        }
        const validate = this.ajv.compile(schema);
        const valid = validate(data);

        if (!valid) {
            console.debug(validate.errors);

            const errorMessage = this.generateErrorMessage(validate.errors);

            throw new this.Fault(errorMessage, 400);
        }
    }

    /**
     * Generates an error message from Ajv validation errors.
     *
     * @param {Object[]} errors - Array of Ajv validation errors.
     * @returns {string} Concatenated error messages.
     */
    generateErrorMessage(errors) {
        const error = errors[0],
            _field = error.instancePath.slice(1),
            _params = error.params,
            _limit = _params.limit;

        const errorMessages = {
            errorMessage: () => error.message,
            additionalProperties: () =>
                `Unexpected property '${_params.additionalProperty}'`,
            required: () =>
                `Missing required field '${_params.missingProperty}'`,
            minLength: () =>
                `'${
                    _field || ""
                }' should be at least ${_limit} characters long`,
            maxLength: () =>
                `'${_field || ""}' should be at most ${_limit} characters long`,
            type: () =>
                `'${error.instancePath.slice(1)}' must be of type '${
                    _params.type
                }'`,
            format: () => `'${_field}' must be a valid ${_params.format} value`,
            minimum: () =>
                `'${_field}' must be greater than or equal to ${_limit}`,
            maximum: () =>
                `'${_field}' must be less than or equal to ${_limit}`,
            pattern: () =>
                `'${_field}' must match the pattern '${_params.pattern}'`,
        };

        return errorMessages[error.keyword]
            ? errorMessages[error.keyword]()
            : `Invalid field '${_field}'`;
    }
}

module.exports = RequestValidator;
