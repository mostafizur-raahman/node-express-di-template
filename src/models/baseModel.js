const mongoose = require("mongoose");

const auditSchema = {
    states: [
        {
            // even though we had three states, we have been using only one here for ease of access
            state: {
                type: String,
                enum: ["CREATED", "UPDATED", "DELETED"],
                default: "UPDATED",
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            payload: Object,
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
};

const generateModel = ({
    modelName,
    schema,

    hasAudit = true,
    connection = mongoose,
}) => {
    const mergedSchema = new mongoose.Schema(
        {
            ...schema,
            ...(hasAudit ? auditSchema : {}),
            isDeleted: {
                type: Boolean,
                default: false,
            },
        },
        { timestamps: true }
    );

    return connection.model(modelName, mergedSchema);
};

const validateQuery = (query) => {
    if (!query) {
        throw new Error("Query cannot be empty.");
    }

    if (typeof query !== "object") {
        throw new Error("Query must be an object.");
    }

    if (Object.keys(query).length === 0) {
        throw new Error("Query cannot be empty.");
    }

    if (
        Object.keys(query).every(
            (key) =>
                !key ||
                key === null ||
                key === undefined ||
                key === "" ||
                typeof key !== "string"
        )
    ) {
        throw new Error("Query cannot be empty.");
    }
};

module.exports = {
    generateModel,
    validateQuery,
};
