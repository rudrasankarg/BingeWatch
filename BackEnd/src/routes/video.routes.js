import { Router } from "express";
import { 
    createVideo, 
    deleteVideo, 
    likeVideo, 
    unlikeVideo, 
    getVideos, 
    getVideoById,
    getCategories
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(upload.single("videoFile"), createVideo);
router.route("/").get(getVideos);
router.route("/:id").get(getVideoById);
router.route("/:id").delete(deleteVideo);
router.route("/:id/like").post(likeVideo);
router.route("/:id/unlike").post(unlikeVideo);

export default router;
