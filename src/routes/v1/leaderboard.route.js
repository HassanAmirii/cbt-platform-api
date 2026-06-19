const express = require("express");

const router = express.Router();
const { auth } = require("../../middleware/auth.middleware");
const leaderboardController = require("../../controllers/leaderboard.controller");

router.get("/leaderboard", auth, leaderboardController.getLeaderboard);

module.exports = router;
