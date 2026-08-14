import { Router } from "express";
import { searchVideos } from "../controllers/video.controller.js";

const router = Router();

router.route("/").get(searchVideos);

export default router;
