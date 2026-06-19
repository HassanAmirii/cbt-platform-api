const Result = require("../models/result.model");

const timelineFilters = {
  today: 24 * 60 * 60 * 1000,
  lastMonth: 30 * 24 * 60 * 60 * 1000,
};

const buildTimelineMatch = (timeline) => {
  if (timeline === "allTime") return {};

  const duration = timelineFilters[timeline];
  if (!duration) {
    const error = new Error(
      "invalid timeline: choose today, lastMonth or allTime",
    );
    error.status = 400;
    throw error;
  }

  return { createdAt: { $gte: new Date(Date.now() - duration) } };
};

exports.getLeaderboard = async ({
  courseCode,
  timeline = "allTime",
  page = 1,
  limit = 10,
  level,
  department,
}) => {
  if (!level || !department) {
    const error = new Error(
      "bad request, level and department missing in login payload",
    );
    error.status = 400;
    throw error;
  }

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (parsedPage - 1) * parsedLimit;
  const normalizedCourseCode = courseCode ? courseCode.toUpperCase() : null;

  const match = {
    level,
    department,
    ...buildTimelineMatch(timeline),
  };

  if (normalizedCourseCode) {
    match.courseCode = normalizedCourseCode;
  }

  const groupId = normalizedCourseCode ? "$student" : "$student";

  const [leaderboardData] = await Result.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupId,
        averageScore: { $avg: "$score" },
        totalSessions: { $sum: 1 },
        department: { $first: "$department" },
        level: { $first: "$level" },
      },
    },
    { $sort: { averageScore: -1, _id: 1 } },
    {
      $facet: {
        metadata: [{ $count: "totalResults" }],
        results: [
          { $skip: skip },
          { $limit: parsedLimit },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "student",
            },
          },
          { $unwind: "$student" },
          {
            $project: {
              _id: 0,
              studentName: "$student.username",
              department: 1,
              level: 1,
              courseCode: normalizedCourseCode || "ALL",
              averageScore: { $round: ["$averageScore", 1] },
              totalSessions: 1,
            },
          },
        ],
      },
    },
  ]);

  const totalResults = leaderboardData?.metadata[0]?.totalResults || 0;
  const totalPages = Math.ceil(totalResults / parsedLimit);
  const leaderboard = (leaderboardData?.results || []).map((result, index) => ({
    rank: skip + index + 1,
    ...result,
  }));

  return {
    leaderboard,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      totalResults,
    },
  };
};
