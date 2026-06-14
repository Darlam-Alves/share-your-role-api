const express = require("express");
const userController = require("../controllers/user");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.post("/users", userController.createUser);
router.get("/me", authenticate, userController.getMyProfile);
router.patch("/me", authenticate, userController.updateMyProfile);
router.get("/me/events", authenticate, userController.getMyEvents);
router.get("/users/:id/profile", userController.getPublicProfile);

module.exports = router;
