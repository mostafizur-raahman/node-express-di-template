const { default: mongoose } = require("mongoose");

class BaseRepository {
    constructor(model) {
        this.model = model;

        this.defaultProjection = {
            password: 0,
            __v: 0,
            isDeleted: 0,
            editors: 0,
        };

        // v2, updated
        this.baseProjection = {
            negative: {
                default: {
                    __v: 0,
                    isDeleted: 0,
                    states: 0,
                    createdBy: 0,
                },
                date: {
                    createdAt: 0,
                    updatedAt: 0,
                },
            },
        };

        this.modelName = model.modelName;
    }

    /**
     * Creates an ObjectId from a string.
     * Uses new mechanism to create ObjectId instead of mongoose.Types.ObjectId
     *
     * @param {string} id String to be converted to ObjectId
     */
    createObjectId(id) {
        mongoose.Types.ObjectId.createFromTime(id);
    }

    async createDocIfNotExist(query, entity, userId) {
        try {
            const doc = await this.model.findOne(query);

            if (!doc) {
                const newDoc = await this.create({
                    ...entity,
                    createdBy: userId,
                });

                return newDoc;
            }

            return doc;
        } catch (error) {
            throw error;
        }
    }

    async checkForUnAllowedItems(query, ids) {
        console.group("Checking for UnAllowed Items on ", this.modelName);
        console.debug(query);
        console.debug(ids);

        const doc = await this.model.findOne(query);

        console.debug(doc ? doc._id : null);
        console.groupEnd("Checking for UnAllowed Items on ", this.modelName);

        if (
            doc &&
            ((Array.isArray(ids) && ids.includes(doc._id.toString())) ||
                ids === doc._id.toString())
        ) {
            return false;
        }

        return true;
    }

    createLookupStage({ localField, foreignField = "_id", as, from }) {
        return [
            {
                $lookup: {
                    from: from,
                    localField: localField,
                    foreignField: foreignField,
                    as: as,
                },
            },
        ];
    }

    createLookupAndUnWindStage({ localField, foreignField = "_id", as, from }) {
        return [
            {
                $lookup: {
                    from: from,
                    localField: localField,
                    foreignField: foreignField,
                    as: as,
                },
            },
            {
                $unwind: {
                    path: "$" + `${as}`,
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];
    }

    /**
     * Adds a new entity to the database.
     *
     * @param {Object} entity
     * @throws {Error} If the entity fails to be created.
     * @returns {Promise<Object>} The newly created entity.
     */
    async create(entity) {
        try {
            const doc = new this.model(entity);
            const newDoc = await doc.save(entity);

            return newDoc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Adds multiple entities to the database.
     *
     * @param {Array<Object>} entities
     * @throws {Error} If any of the entities fail to be created.
     * @returns {Promise<Array<Object>>} The newly created entities.
     */
    async createMany(entities) {
        try {
            const docs = await this.model.insertMany(entities);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds a single entity by its ID.
     *
     * @param {string} id
     * @returns {Promise<Object>} The found entity.
     * @throws {Error} If no entity is found.
     * @throws {Error} If the entity is already deleted.
     */
    async findById(id) {
        try {
            const doc = await this.model.findOne({ _id: id, isDeleted: false });

            return doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates an entity that match the provided query.
     *
     * @param {Object} query
     * @param {Object} entity
     * @returns {Promise<Array<Object>>} The updated entities.
     * @throws {Error} If the entities fail to be updated.
     * @throws {Error} If no entities are found.
     * @throws {Error} If the query is invalid.
     */
    async updateOneByQuery(query, entity) {
        try {
            const docs = await this.model.updateOne(query, entity);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    async findAndUpdateOneByQuery(query, entity) {
        try {
            const docs = await this.model.findOneAndUpdate(query, entity);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    async upsert(query, entity) {
        try {
            const docs = await this.model.findOneAndUpdate(
                query,
                { $set: entity },
                { upsert: true, new: true, returnOriginal: false }
            );

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds all entities.
     *
     * @returns {Promise<Array<Object>>} The found entities.
     * @throws {Error} If no entities are found.
     */
    async findAll({ fields = "-password" }) {
        try {
            const docs = await this.model
                .find({ isDeleted: false })
                .select(fields);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates an entity by its ID.
     *
     * @param {string} id
     * @param {Object} entity
     * @returns {Promise<Object>} The updated entity.
     * @throws {Error} If the entity fails to be updated.
     * @throws {Error} If the entity is not found.
     */
    async updateById(id, entity) {
        try {
            const doc = await this.model.findOneAndUpdate(
                { _id: id, isDeleted: false },
                entity,
                { new: true }
            );

            return doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes an entity by its ID.
     *
     * @param {string} id
     * @returns {Promise<Object>} The deleted entity.
     * @throws {Error} If the entity fails to be deleted.
     * @throws {Error} If the entity is already deleted.
     */
    async deleteById(id) {
        try {
            const doc = await this.model.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            );

            return doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes all entities.
     *
     * @returns {Promise<Array<Object>>} The deleted entities.
     * @throws {Error} If the entities fail to be deleted.
     * @throws {Error} If no entities are found.
     */
    async deleteAll() {
        try {
            const docs = await this.model.updateMany(
                { isDeleted: false },
                { isDeleted: true },
                { new: true }
            );

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds all entities that match the provided query.
     *
     * @param {Object} query
     * @param {Object} sortOptions
     * @returns {Promise<Array<Object>>} The found entities.
     * @throws {Error} If no entities are found.
     * @throws {Error} If the query is invalid.
     */
    async findByQuery(query, sortOptions = {}, _selection = "-password") {
        try {
            const docs = await this.model
                .find(query)
                .select(_selection)
                .sort(sortOptions);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds a single entity that matches the provided query.
     *
     * @param {Object} query
     * @returns {Promise<Object>} The found entity.
     * @throws {Error} If no entity is found.
     * @throws {Error} If the query is invalid.
     */
    async findOneByQuery(query) {
        console.group(this.model.modelName, "findOneByQuery");
        console.debug(query);
        console.groupEnd(this.model.modelName, "findOneByQuery");

        try {
            const doc = await this.model.findOne(query);

            return doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Updates all entities that match the provided query.
     *
     * @param {Object} query
     * @param {Object} entity
     * @returns {Promise<Array<Object>>} The updated entities.
     * @throws {Error} If the entities fail to be updated.
     * @throws {Error} If no entities are found.
     * @throws {Error} If the query is invalid.
     */
    async updateManyByQuery(query, entity) {
        try {
            const docs = await this.model.updateMany(query, entity);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Deletes all entities that match the provided query.
     *
     * @param {Object} query
     * @returns {Promise<Array<Object>>} The deleted entities.
     * @throws {Error} If the entities fail to be deleted.
     * @throws {Error} If no entities are found.
     * @throws {Error} If the query is invalid.
     */
    async deleteManyByQuery(query, deletedBy) {
        try {
            const docs = await this.model.updateMany(query, {
                $set: {
                    isDeleted: true,
                    ...deletedBy,
                },
            });

            return docs;
        } catch (error) {
            throw error;
        }
    }

    async hardDeleteManyByQuery(query) {
        try {
            const docs = await this.model.deleteMany(query);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Counts all entities.
     *
     * @returns {Promise<number>} The number of entities.
     * @throws {Error} If the entities fail to be counted.
     * @throws {Error} If no entities are found.
     */
    async countAll(query = { isDeleted: false }) {
        try {
            const count = await this.model.countDocuments(query);

            return count;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Counts all entities that match the provided query.
     *
     * @param {Object} query
     * @returns {Promise<number>} The number of entities.
     * @throws {Error} If the entities fail to be counted.
     * @throws {Error} If no entities are found.
     * @throws {Error} If the query is invalid.
     */
    async countByQuery(query) {
        try {
            const count = await this.model.countDocuments(query);

            return count;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Checks if an entity exists by its ID.
     *
     * @param {string} id
     * @returns {Promise<boolean>} Whether or not the entity exists.
     * @throws {Error} If the entity fails to be checked.
     */
    async existsById(id) {
        try {
            const doc = await this.model.findOne({ _id: id });

            return !!doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Checks if an entity exists that matches the provided query.
     *
     * @param {Object} query
     * @returns {Promise<boolean>} Whether or not the entity exists.
     * @throws {Error} If the entity fails to be checked.
     * @throws {Error} If the query is invalid.
     */
    async existsByQuery(query) {
        try {
            const doc = await this.model.findOne(query);

            return !!doc;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Aggregate entities.
     *
     * @param {Array<Object>} queries Aggregation queries.
     * @returns {Promise<Array<Object>>} The aggregated entities.
     */
    async aggregate(queries) {
        try {
            console.time("Time spent in DB Query");

            const docs = await this.model.aggregate(queries);

            console.timeEnd("Time spent in DB Query");

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Gets distinct values of a field.
     *
     * @param {String} field The field to get distinct values of
     * @param {Object} query The query to match
     * @returns
     */
    async getDistinct(
        field,
        query = { [field]: { $exists: true, $ne: null } }
    ) {
        try {
            const docs = await this.model.distinct(field, query);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Finds the last entity.
     *
     * @returns {Promise<Object>} The found entity.
     */
    async findLast() {
        try {
            const doc = await this.model.findOne().sort({ createdAt: -1 });

            return doc;
        } catch (error) {
            throw error;
        }
    }

    async createDateRangeQuery(range) {
        let _date = null;

        if (range === "daily") {
            _date = new Date();
        } else if (range === "weekly") {
            _date = new Date();
            _date.setDate(_date.getDate() - 7);
        } else if (range === "monthly") {
            _date = new Date();
            _date.setDate(_date.getDate() - 30);
        }

        _date.setHours(0, 0, 0, 0); // set to midnight, may notice 1 day difference

        return _date;
    }
}

module.exports = BaseRepository;
