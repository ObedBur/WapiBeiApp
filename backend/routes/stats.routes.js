import express from "express";
import { getPublicStats } from "../controllers/stats.controller.js";

const router = express.Router();

// Route publique → pas besoin d’être connecté
router.get("/public", getPublicStats);

export default router;
