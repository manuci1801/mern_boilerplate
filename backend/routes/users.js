const { userController } = require("../controllers");
const isAuth = require("../middleware/isAuth");

const router = require("express").Router();

router.route("/sign-up").post(userController.signUp);
router.route("/sign-in").post(userController.signIn);
router.route("/resend-verify").post(userController.resendVerify);
router.route("/verify-user/:token").post(userController.verifyUser);

module.exports = router;
