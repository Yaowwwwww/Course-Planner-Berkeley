const express = require("express");
const asyncHandler = require("express-async-handler");
const cors = require("cors");
const bodyParser = require("body-parser");
const { connectToDB, Professor, Course } = require("./database");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(__dirname + "/public"));


app.post("/new-professors", asyncHandler(async (req, res) => {
      const newProfessor = new Professor({
        name: req.body.name,
        department: req.body.department,
        email: req.body.email,
        courses: req.body.courses,
        relevant_reviews: req.body.relevant_reviews,
      });
      await newProfessor.save();
      res.status(201).json(newProfessor);
    })
  );

app.get("/professors", asyncHandler(async (req, res) => {
      const allProfessors = await Professor.find();
      res.json(allProfessors);
    })
  );

app.get("/professors/search", asyncHandler(async (req, res) => {
    const { name, email, department, courses } = req.query;
    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (email) query.email = { $regex: email, $options: "i" };
    if (department) query.department = { $regex: department, $options: "i" };
    if (courses) query.courses = { $regex: courses, $options: "i" };
    const professors = await Professor.find(query);
    if (professors.length > 0) {
        res.json(professors);
    } else {
        res.status(404).json({ error: "No professors are matched" });
    }
}));

app.patch("/professor/:name/add-review", asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { relevant_reviews } = req.body;
  if (!relevant_reviews || !Array.isArray(relevant_reviews)) {
      return res.status(400).json({ error: "Invalid or missing relevant_reviews" });
  }
  try {
      const updatedProfessor = await Professor.findOneAndUpdate(
          { name: name },
          { $push: { relevant_reviews: { $each: relevant_reviews } } },
          { new: true, runValidators: true }
      );
      if (updatedProfessor) {
          res.json(updatedProfessor);
      } else {
          res.status(404).json({ error: "Professor not found" });
      }
  } catch (error) {
      res.status(400).json({ error: "Failed to update professor", details: error.message });
  }
}));


app.delete("/professors/delete/:name", asyncHandler(async (req, res) => {
    const deletedProfessor = await Professor.findOneAndDelete({ name: req.params.name });
    if (deletedProfessor) {
        res.json(deletedProfessor);
    } else {
        res.status(404).json({ error: "Professor not found" });
    }
}));

app.get("/course/:name", asyncHandler(async (req, res) => {
  const course = await Course.findOne({ name: new RegExp(req.params.name, "i") })
      .populate({
          path: "professor",
          select: "name relevant_reviews",
      });

  if (course) {
      if (course.professor && typeof course.professor === "object") {
          res.json(course);
      } else {
          res.json({ ...course.toObject(), professor: course.professor });
      }
  } else {
      res.status(404).json({ error: "Course not found" });
  }
}));


app.post("/new-course", asyncHandler(async (req, res) => {
  let professorIdOrName;
  const professor = await Professor.findOne({ name: req.body.professor });
  if (professor) {
      professorIdOrName = professor._id; 
  } else {
      professorIdOrName = req.body.professor; 
  }
  const newCourse = new Course({
      name: req.body.name,
      professor: professorIdOrName,
      description: req.body.description,
      prerequisites: req.body.prerequisites,
      lecture_slide_example: req.body.lecture_slide_example,
      final_exam_example: req.body.final_exam_example,
  });
  await newCourse.save();
  res.status(201).json(newCourse);
}));

async function start() {
    await connectToDB();

    return app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
}

if (require.main === module) {
    start().catch((err) => console.error(err));
}
