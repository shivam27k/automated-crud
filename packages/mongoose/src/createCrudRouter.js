import express from 'express';

function parseListQuery(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Math.max(1, Number(query.limit) || 20)));
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
        sort: query.sort || "-createdAt",
        select: query.select || "",
        q: query.q || "",
        include: query.include || ""
    };
}

function normalizeInclude(include) {
    if (!include) return [];

    return String(include).split(",").map((v) => v.trim()).filter(Boolean);
}

function pickAllowedIncludes(includes, allowedIncludes = []) {
    if (!allowedIncludes.length) return includes;
    const allowed = new Set(allowedIncludes);
    return includes.filter((i) => allowed.has(i))
}

function parseFilter(query = {}) {
    const reserved = new Set(["page", "limit", "sort", "select", "q", "include", "filter"]);

    const fromQuery = {};

    for (const [key, value] of Object.entries(query)) {
        if (reserved.has(key)) continue;
        fromQuery[key] = value;
    }

    if (!query.filter) return fromQuery;

    try {
        const parsed = JSON.parse(query.filter);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return { ...fromQuery, ...parsed };
        }
    } catch (error) {
        // ignore invalid filter JSON
    }

    return fromQuery;
}

function applySearch(filter, q, searchFields = []) {
    if (!q || !searchFields.length) return filter;

    const regex = new RegExp(q, "i");

    return {
        ...filter,
        $or: searchFields.map((field) => ({ [field]: regex }))
    };
}

export function createCrudRouter({
    model,
    searchFields = [],
    allowedIncludes = [],
    idParam = "id"
}) {
    if (!model) throw new Error("createCrudRouter requires a Mongoose model");

    const router = express.Router();
    const idPath = `/:${idParam}`;

    // LIST
    router.get("/", async (req, res, next) => {
        try {
            const listQuery = parseListQuery(req.query);
            const filter = applySearch(parseFilter(req.query), listQuery.q, searchFields);

            let query = model.find(filter);

            if (listQuery.select) query = query.select(listQuery.select);
            if (listQuery.sort) query = query.sort(listQuery.sort);

            const includes = pickAllowedIncludes(
                normalizeInclude(listQuery.include),
                allowedIncludes
            );

            for (const path of includes) {
                query = query.populate(path);
            }

            const [items, total] = await Promise.all([
                query.skip(listQuery.skip).limit(listQuery.limit).lean().exec(),
                model.countDocuments(filter)
            ]);

            res.json({
                data: items,
                meta: {
                    total,
                    page: listQuery.page,
                    limit: listQuery.limit,
                    pages: Math.max(1, Math.ceil(total / listQuery.limit))
                }
            });
        } catch (error) {
            next(error);
        }
    });

    // GET ONE
    router.get(idPath, async (req, res, next) => {
        try {
            let query = model.findById(req.params[idParam]);

            if (req.query.select) query = query.select(String(req.query.select));

            const includes = pickAllowedIncludes(
                normalizeInclude(req.query.include),
                allowedIncludes
            );

            for (const path of includes) {
                query = query.populate(path);
            }

            const doc = await query.lean().exec();

            if (!doc) {
                return res.status(404).json({ error: { message: "Not found" } });
            }

            res.json({ data: doc });

        } catch (error) {
            next(error);
        }
    });

    // CREATE
    router.post("/", async (req, res, next) => {
        try {
            const created = await model.create(req.body);
            res.status(201).json({ data: created.toObject() });
        } catch (error) {
            next(error);
        }
    });

    // UPDATE
    router.patch(idPath, async (req, res, next) => {
        try {
            const updated = await model.findByIdAndUpdate(req.params[idParam], req.body, {
                new: true,
                runValidators: true
            }).lean().exec()

            if (!updated) {
                return res.status(404).json({ error: { message: "Not found" } });
            }

            res.json({ data: updated });
        } catch (error) {
            next(error);
        }
    });

    // DELETE  
    router.delete(idPath, async (req, res, next) => {
        try {
            const deleted = await model.findByIdAndDelete(req.params[idParam]).lean().exec();

            if (!deleted) {
                return res.status(404).json({ error: { message: "Not found" } });
            }

            res.json({ data: deleted });
        } catch (error) {
            next(error);
        }
    });

    return router;
}