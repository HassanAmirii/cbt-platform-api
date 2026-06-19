const Result = require("../models/result.model");

exports.getStudentResult = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [results, totalResults] = await Promise.all([
      Result.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Result.countDocuments({ student: req.user.id }),
    ]);

    const totalPages = Math.ceil(totalResults / limit);
    return res.status(200).json({
      success: true,
      results,
      pagination: {
        totalResults,
        totalPages,
        limit,
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { courseCode, department } = req.query;

    const pipeline = [];

    if (courseCode) {
      pipeline.push({
        $match: { courseCode: courseCode.toUpperCase() },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            student: "$student",
            courseCode: "$courseCode",
          },
          averageScore: { $avg: "$score" },
          totalSessions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
    );

    if (department) {
      pipeline.push({
        $match: { "student.department": department },
      });
    }

    pipeline.push(
      { $sort: { averageScore: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          studentName: "$student.username",
          department: "$student.department",
          courseCode: "$_id.courseCode",
          averageScore: { $round: ["$averageScore", 0] },
          totalSessions: 1,
        },
      },
    );

    const results = await Result.aggregate(pipeline);
    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      ...result,
    }));

    return res.status(200).json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
