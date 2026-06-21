const mentorService = require("../services/mentor.service");

exports.registerMentor = async (req, res, next) => {
  try {
    const { nickname, whatsapp, bio, internalCode } = req.body;

    if (!nickname || !whatsapp || !bio || !internalCode) {
      return res.status(400).json({
        message: "nickname, whatsapp, bio and internalCode are required",
      });
    }

    if (internalCode !== process.env.MENTOR_SECRET_CODE) {
      return res.status(403).json({ message: "invalid mentor internal code" });
    }

    const mentor = await mentorService.registerMentor({
      userId: req.user.id,
      department: req.user.department,
      nickname,
      whatsapp,
      bio,
    });

    return res.status(201).json({ success: true, mentor });
  } catch (error) {
    next(error);
  }
};

exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await mentorService.getDepartmentMentors(
      req.user.department,
    );
    return res.status(200).json({ success: true, mentors });
  } catch (error) {
    next(error);
  }
};

exports.updateMentorProfile = async (req, res, next) => {
  try {
    const mentor = await mentorService.updateMentorProfile({
      userId: req.user.id,
      updates: req.body,
    });

    return res.status(200).json({ success: true, mentor });
  } catch (error) {
    next(error);
  }
};
exports.getMentorProfile = async (req, res, next) => {
  try {
    const profile = await mentorService.getMentorProfile(req.user.id);
    res.status(200).json({ success: true, mentor: profile });
  } catch (err) {
    next(err);
  }
};
