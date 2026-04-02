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
