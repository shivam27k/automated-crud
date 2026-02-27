import express from 'express';
import mongoose from 'mongoose';
import { createCrudRouter } from '../src/index.js';

const app = express();
app.use(express.json());

if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI");
}
await mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model("User", new mongoose.Schema(
    {
        name: { type: String, required: true, index: true },
        email: { type: String, required: true, unique: true, index: true }
    },
    { timestamps: true }
));

app.use(
    "/users",
    createCrudRouter({
        model: User,
        searchFields: ["name", "email"],
        allowedIncludes: []
    })
)

app.use((err, req, res, next) => {
    res.status(500).json({ error: { message: err.message || "Internal error" } });
});

app.listen(4000, () => {
    console.log("Running at http://localhost:4000");
});