const express = require("express");
const eventController = require("../controllers/event");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/events", eventController.listEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", authenticate, requireRole("institutional", "admin"), eventController.createEvent);

module.exports = router;
