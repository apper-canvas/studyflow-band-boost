import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import StatCard from "@/components/molecules/StatCard";
import AssignmentCard from "@/components/molecules/AssignmentCard";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  const upcomingAssignments = assignments.filter(
    a => !a.completed && isAfter(new Date(a.dueDate), now) && isBefore(new Date(a.dueDate), weekFromNow)
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdueAssignments = assignments.filter(
    a => !a.completed && isBefore(new Date(a.dueDate), now)
  );

  const completedCount = assignments.filter(a => a.completed).length;
  const totalCount = assignments.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const courseGrades = courses.map(course => {
    const courseAssignments = assignments.filter(
      a => a.courseId === course.Id && a.completed && a.grade !== null
    );
    
    if (courseAssignments.length === 0) return null;
    
    const avgGrade = Math.round(
      courseAssignments.reduce((sum, a) => sum + a.grade, 0) / courseAssignments.length
    );
    
    return { course, grade: avgGrade };
  }).filter(Boolean);

  const handleToggleComplete = async (id) => {
    try {
      await assignmentService.toggleComplete(id);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle assignment:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-lg text-slate-600">
          Welcome back! Here's what's happening with your studies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Upcoming (7 days)"
          value={upcomingAssignments.length}
          icon="Calendar"
          gradient="from-primary to-secondary"
          delay={0}
        />
        <StatCard
          title="Overdue"
          value={overdueAssignments.length}
          icon="AlertTriangle"
          gradient="from-error to-red-600"
          delay={0.1}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon="TrendingUp"
          gradient="from-success to-emerald-600"
          delay={0.2}
        />
        <StatCard
          title="Active Courses"
          value={courses.length}
          icon="BookOpen"
          gradient="from-accent to-pink-600"
          delay={0.3}
        />
      </div>

      {overdueAssignments.length > 0 && (
        <Card className="p-6 border-l-4 border-error">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-error/10 rounded-xl">
              <ApperIcon name="AlertTriangle" size={24} className="text-error" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {overdueAssignments.length} Overdue Assignment{overdueAssignments.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-slate-600">
                You have assignments that need immediate attention. Review and complete them as soon as possible.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Assignments</h2>
            <button
              onClick={() => navigate("/assignments")}
              className="text-primary font-semibold hover:text-secondary transition-colors duration-200"
            >
              View All
            </button>
          </div>
          
          {upcomingAssignments.length === 0 ? (
            <Empty
              title="All caught up!"
              message="No assignments due in the next 7 days"
              icon="CheckCircle2"
            />
          ) : (
            <div className="space-y-4">
              {upcomingAssignments.slice(0, 5).map((assignment) => {
                const course = courses.find(c => c.Id === assignment.courseId);
                return (
                  <AssignmentCard
                    key={assignment.Id}
                    assignment={assignment}
                    course={course}
                    onToggle={handleToggleComplete}
                    onEdit={() => navigate("/assignments")}
                    onDelete={() => navigate("/assignments")}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Grades</h2>
          
          {courseGrades.length === 0 ? (
            <Empty
              title="No grades yet"
              message="Complete and grade assignments to see your progress"
              icon="Award"
            />
          ) : (
            <div className="space-y-4">
              {courseGrades.map(({ course, grade }) => (
                <Card
                  key={course.Id}
                  className="p-6 border-l-4 cursor-pointer hover:scale-102 transition-transform duration-200"
                  style={{ borderLeftColor: course.color }}
                  onClick={() => navigate(`/courses/${course.Id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{course.code}</h3>
                      <p className="text-sm text-slate-600">{course.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{grade}%</div>
                      <div className="text-xs text-slate-500">Target: {course.targetGrade}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((grade / course.targetGrade) * 100, 100)}%`,
                        backgroundColor: grade >= course.targetGrade ? "#10b981" : course.color
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;