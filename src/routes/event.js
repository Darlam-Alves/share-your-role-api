const express = require("express");
const eventController = require("../controllers/event");
const { authenticate, requireRole } = require("../middlewares/auth");

const router = express.Router(); // <--- ESSA LINHA É A QUE ESTAVA FALTANDO!

router.get("/events", eventController.listEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", authenticate, requireRole("institutional", "admin"), eventController.createEvent);
router.patch("/events/:id", authenticate, requireRole("institutional", "admin"), eventController.updateEvent);
router.delete("/events/:id", authenticate, eventController.deleteEvent);

module.exports = router;
