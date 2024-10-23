const { default: mongoose } = require("mongoose");

class BaseRepository {
    constructor(model) {
        this.model = model;
        this.modelName = model.modelName;
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

    async create(entity) {
        try {
            const doc = new this.model(entity);
            const newDoc = await doc.save(entity);

            return newDoc;
        } catch (error) {
            throw error;
        }
    }

    async createMany(entities) {
        try {
            const docs = await this.model.insertMany(entities);

            return docs;
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const doc = await this.model.findOne({ _id: id, isDeleted: false });

            return doc;
        } catch (error) {
            throw error;
        }
    }

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

    async updateManyByQuery(query, entity) {
        try {
            const docs = await this.model.updateMany(query, entity);

            return docs;
        } catch (error) {
            throw error;
        }
    }

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

    async countAll(query = { isDeleted: false }) {
        try {
            const count = await this.model.countDocuments(query);

            return count;
        } catch (error) {
            throw error;
        }
    }

    async countByQuery(query) {
        try {
            const count = await this.model.countDocuments(query);

            return count;
        } catch (error) {
            throw error;
        }
    }

    async existsById(id) {
        try {
            const doc = await this.model.findOne({ _id: id });

            return !!doc;
        } catch (error) {
            throw error;
        }
    }

    async existsByQuery(query) {
        try {
            const doc = await this.model.findOne(query);

            return !!doc;
        } catch (error) {
            throw error;
        }
    }

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
