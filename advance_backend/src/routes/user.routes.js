import { Router } from "express";
import {logoutUser, loginUser, registerUser} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1,
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
registerUser)
// note:- lineno 8 to 17 middleware create kiya hai humne


router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT,logoutUser)


export default router;