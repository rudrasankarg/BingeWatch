import { Router } from "express";
import { getChannels } from "../controllers/channel.controller.js";

const router = Router();

router.route("/").get(getChannels);

export default router;
