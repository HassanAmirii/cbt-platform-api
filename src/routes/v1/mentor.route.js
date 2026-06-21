const express = require("express");

const router = express.Router();
const { auth } = require("../../middleware/auth.middleware");
const mentorController = require("../../controllers/mentor.controller");

router.post("/mentors/register", auth, mentorController.registerMentor);
router.get("/mentors", auth, mentorController.getMentors);
router.put("/mentors/profile", auth, mentorController.updateMentorProfile);
router.get("/mentors/profile", auth, mentorController.getMentorProfile);
module.exports = router;
