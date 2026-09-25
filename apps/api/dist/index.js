"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./routes/auth");
const campaigns_1 = require("./routes/campaigns");
const jobs_1 = require("./routes/jobs");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', auth_1.authRoutes);
app.use('/campaigns', campaigns_1.campaignRoutes);
app.use('/jobs', jobs_1.jobRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
