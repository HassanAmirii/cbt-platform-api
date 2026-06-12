require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/question.model");
const fileName = process.argv[3];
const data = require(`../../data/COMP_SCI/100/2NDSEM/${fileName}.json`);
mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

const flat = [];
Object.entries(data.weeks).forEach(([weekKey, weekData]) => {
  weekData.questions.forEach((q) => {
    flat.push({
      courseCode: data.courseCode,
      department: data.department,
      level: data.level,
      semester: weekData.semester,
      week: weekData.week,
      topic: weekData.topic,
      ...q,
    });
  });
});

const importData = async function () {
  try {
    await Question.deleteMany();
    await Question.insertMany(flat);
    console.log("✅ data imported succesfully");
    process.exit();
  } catch (error) {
    console.error("❌ error importing data", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
}
