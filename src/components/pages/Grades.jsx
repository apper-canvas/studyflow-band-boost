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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Grades</h1>
        <p className="text-lg text-slate-600">
          Track your academic performance and calculate your grades.
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