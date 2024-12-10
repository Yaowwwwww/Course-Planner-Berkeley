const mongoose = require("mongoose");

const dbConnectionUri = "mongodb+srv://louisliuhf:iRyhQ8M_9Kqgw4y@idk.d5gcq.mongodb.net/";
const dbName = "DecalFinal";

const professorSchema = new mongoose.Schema({
    name: String,
    department: String, 
    email: String,
    courses: [String],
    relevant_reviews: [String]
});

const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "Professor" },
    prerequisites: [String],
    lecture_slide_example: String, 
    final_exam_example: String 
});

const Professor = mongoose.model("Professor", professorSchema);

const Course = mongoose.model("Course", courseSchema);

async function connectToDB() {
    await mongoose.connect(dbConnectionUri, { dbName });
    console.log("Successfully connected to MongoDB");
}

module.exports = { connectToDB, Professor, Course };
