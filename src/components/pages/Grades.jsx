import React, { useState, useEffect } from "react";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const Grades = () => {
const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("all");
const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesData, assignmentsData] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll()
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
      if (coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0].Id);
      }
    } catch (err) {
      setError(err.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateOverallGPA = (semesterFilter = "all") => {
    const filteredCourses = semesterFilter === "all" 
      ? courses 
      : courses.filter(c => c.semester === semesterFilter);

    const coursesWithGrades = filteredCourses.map(course => {
      const courseAssignments = assignments.filter(
        a => a.courseId === course.Id && a.completed && a.grade !== null
      );

      if (courseAssignments.length === 0 || !course.gradeCategories) return null;

      const categoryGrades = course.gradeCategories.map(category => {
        const categoryAssignments = courseAssignments.filter(a => a.category === category.name);
        if (categoryAssignments.length === 0) return { weight: category.weight, weightedScore: 0 };
        const average = categoryAssignments.reduce((sum, a) => sum + a.grade, 0) / categoryAssignments.length;
        return { weight: category.weight, weightedScore: (average * category.weight) / 100 };
      });

      const currentGrade = categoryGrades.reduce((sum, cat) => sum + cat.weightedScore, 0);
      const totalWeight = categoryGrades.reduce((sum, cat) => sum + cat.weight, 0);
      const adjustedGrade = totalWeight > 0 ? (currentGrade / totalWeight) * 100 : 0;

      return {
        ...course,
        finalGrade: Math.round(adjustedGrade * 10) / 10,
        credits: course.credits || 3
      };
    }).filter(Boolean);

    const totalCredits = coursesWithGrades.reduce((sum, c) => sum + c.credits, 0);
    const weightedSum = coursesWithGrades.reduce((sum, c) => sum + (c.finalGrade / 100) * 4.0 * c.credits, 0);
    const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

    return { gpa: Math.round(gpa * 100) / 100, totalCredits, coursesWithGrades };
  };

  const calculateSemesterGPA = (semester) => {
    return calculateOverallGPA(semester);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (courses.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Grades</h1>
          <p className="text-lg text-slate-600">
            Track your academic performance and calculate your grades.
          </p>
        </div>
        <Empty
          title="No courses yet"
          message="Add courses and complete assignments to start tracking your grades"
          icon="Award"
        />
      </div>
    );
  }

const semesters = [...new Set(courses.map(c => c.semester).filter(Boolean))].sort();
  const overallGPAData = calculateOverallGPA(selectedSemester);
  const currentCourse = courses.find(c => c.Id === selectedCourse);
  const courseAssignments = assignments.filter(
    a => a.courseId === selectedCourse && a.completed && a.grade !== null
  );

  const calculateGradeByCategory = () => {
    if (!currentCourse || !currentCourse.gradeCategories) return [];

    return currentCourse.gradeCategories.map(category => {
      const categoryAssignments = courseAssignments.filter(
        a => a.category === category.name
      );

      if (categoryAssignments.length === 0) {
        return {
          name: category.name,
          weight: category.weight,
          average: 0,
          count: 0,
          weightedScore: 0
        };
      }

      const average = categoryAssignments.reduce((sum, a) => sum + a.grade, 0) / categoryAssignments.length;
      const weightedScore = (average * category.weight) / 100;

      return {
        name: category.name,
        weight: category.weight,
        average: Math.round(average * 10) / 10,
        count: categoryAssignments.length,
        weightedScore: Math.round(weightedScore * 10) / 10
      };
    });
  };

  const categoryGrades = calculateGradeByCategory();
  const currentGrade = categoryGrades.reduce((sum, cat) => sum + cat.weightedScore, 0);
  const totalWeight = categoryGrades.reduce((sum, cat) => cat.count > 0 ? sum + cat.weight : sum, 0);
  const adjustedGrade = totalWeight > 0 ? (currentGrade / totalWeight) * 100 : 0;

  return (
<div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">GPA Calculator</h1>
        <p className="text-lg text-slate-600">
          Track your overall GPA and individual course performance across semesters.
        </p>
      </div>

      {courses.length === 0 ? (
        <Empty
          title="No courses yet"
          message="Add courses to start tracking your GPA"
          icon="GraduationCap"
        />
      ) : (
        <>
          <Card className="p-6 bg-gradient-to-br from-primary to-secondary text-white">
            <h2 className="text-2xl font-bold mb-6">Overall GPA Summary</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <label className="text-white font-semibold">Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              >
                <option value="all" className="text-slate-900">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem} className="text-slate-900">{sem}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <ApperIcon name="Award" size={24} />
                  <p className="font-semibold">Overall GPA</p>
                </div>
                <p className="text-5xl font-bold">{overallGPAData.gpa.toFixed(2)}</p>
                <p className="text-sm text-white/80 mt-1">Out of 4.0</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <ApperIcon name="BookOpen" size={24} />
                  <p className="font-semibold">Total Credits</p>
                </div>
                <p className="text-5xl font-bold">{overallGPAData.totalCredits}</p>
                <p className="text-sm text-white/80 mt-1">Completed</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <ApperIcon name="GraduationCap" size={24} />
                  <p className="font-semibold">Courses</p>
                </div>
                <p className="text-5xl font-bold">{overallGPAData.coursesWithGrades.length}</p>
                <p className="text-sm text-white/80 mt-1">With grades</p>
              </div>
            </div>
          </Card>

          {overallGPAData.coursesWithGrades.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Grades</h2>
              <div className="space-y-3">
                {overallGPAData.coursesWithGrades.map((course) => {
                  const letterGrade = course.finalGrade >= 93 ? "A" :
                                     course.finalGrade >= 90 ? "A-" :
                                     course.finalGrade >= 87 ? "B+" :
                                     course.finalGrade >= 83 ? "B" :
                                     course.finalGrade >= 80 ? "B-" :
                                     course.finalGrade >= 77 ? "C+" :
                                     course.finalGrade >= 73 ? "C" :
                                     course.finalGrade >= 70 ? "C-" :
                                     course.finalGrade >= 67 ? "D+" :
                                     course.finalGrade >= 63 ? "D" :
                                     course.finalGrade >= 60 ? "D-" : "F";
                  
                  const gradePoints = course.finalGrade >= 93 ? 4.0 :
                                     course.finalGrade >= 90 ? 3.7 :
                                     course.finalGrade >= 87 ? 3.3 :
                                     course.finalGrade >= 83 ? 3.0 :
                                     course.finalGrade >= 80 ? 2.7 :
                                     course.finalGrade >= 77 ? 2.3 :
                                     course.finalGrade >= 73 ? 2.0 :
                                     course.finalGrade >= 70 ? 1.7 :
                                     course.finalGrade >= 67 ? 1.3 :
                                     course.finalGrade >= 63 ? 1.0 :
                                     course.finalGrade >= 60 ? 0.7 : 0.0;

                  return (
                    <div
                      key={course.Id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-2 h-14 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <div>
                          <p className="font-bold text-slate-900 mb-1">{course.code}</p>
                          <p className="text-sm text-slate-600">{course.name}</p>
                          {course.semester && (
                            <Badge variant="default" className="mt-1">{course.semester}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-1">Credits</p>
                          <p className="text-xl font-bold text-slate-900">{course.credits}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-1">Grade</p>
                          <p className="text-xl font-bold text-slate-900">{course.finalGrade}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-1">Letter</p>
                          <p className="text-2xl font-bold text-primary">{letterGrade}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600 mb-1">Points</p>
                          <p className="text-xl font-bold text-slate-900">{gradePoints.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="border-t-2 border-slate-200 pt-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Individual Course Details</h2>
            <p className="text-lg text-slate-600 mb-6">
              View detailed grade breakdown for each course.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {courses.map((course) => (
              <button
                key={course.Id}
                onClick={() => setSelectedCourse(course.Id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedCourse === course.Id
                    ? "text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 hover:shadow-md"
                }`}
                style={
                  selectedCourse === course.Id
                    ? { background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)` }
                    : {}
                }
              >
                {course.code}
              </button>
            ))}
          </div>
        </>
      )}

{currentCourse && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4" style={{ borderLeftColor: currentCourse.color }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${currentCourse.color}20` }}>
                  <ApperIcon name="TrendingUp" size={24} style={{ color: currentCourse.color }} />
                </div>
                <p className="font-semibold text-slate-600">Current Grade</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">
                {Math.round(adjustedGrade)}%
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <ApperIcon name="Target" size={24} className="text-primary" />
                </div>
                <p className="font-semibold text-slate-600">Target Grade</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">
                {currentCourse.targetGrade}%
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <ApperIcon name="ClipboardCheck" size={24} className="text-secondary" />
                </div>
                <p className="font-semibold text-slate-600">Graded Assignments</p>
              </div>
              <p className="text-4xl font-bold text-slate-900">
                {courseAssignments.length}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Grade Breakdown</h2>
            
            {categoryGrades.length === 0 ? (
              <Empty
                title="No grade categories"
                message="Complete and grade assignments to see your breakdown"
                icon="Award"
              />
            ) : (
              <div className="space-y-6">
                {categoryGrades.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">{category.name}</h3>
                        <Badge variant="default">{category.weight}% of grade</Badge>
                        {category.count > 0 && (
                          <Badge variant="primary">{category.count} assignment{category.count !== 1 ? "s" : ""}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {category.count > 0 ? `${category.average}%` : "N/A"}
                        </p>
                        {category.count > 0 && (
                          <p className="text-sm text-slate-600">
                            Weighted: {category.weightedScore}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${category.count > 0 ? category.average : 0}%`,
                          backgroundColor: currentCourse.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {courseAssignments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Graded Assignments</h2>
              <div className="space-y-3">
                {courseAssignments.slice(0, 10).map((assignment) => (
                  <div
                    key={assignment.Id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-1">{assignment.title}</p>
                      {assignment.category && (
                        <Badge variant="default">{assignment.category}</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{assignment.grade}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Grades;