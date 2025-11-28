// backend/src/modules/auth/auth.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./auth.controller");

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/me", controller.getUser);
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);
router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    }),
    controller.googleCallback
);

module.exports = router;
