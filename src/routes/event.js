const express = require("express");
const eventController = require("../controllers/event");

const router = express.Router();

router.post("/events", eventController.createEvent);

module.exports = router;
