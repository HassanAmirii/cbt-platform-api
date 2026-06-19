const leaderboardService = require("../services/leaderboard.service");

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { courseCode, timeline, page, limit } = req.query;
    const { level, department } = req.user;

    const leaderboardData = await leaderboardService.getLeaderboard({
      courseCode,
      timeline,
      page,
      limit,
      level,
      department,
    });

    return res.status(200).json({
      success: true,
      ...leaderboardData,
    });
  } catch (error) {
    next(error);
  }
};
