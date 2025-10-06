import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { scheduleService } from "@/services/api/scheduleService";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00"
];

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, coursesData, assignmentsData] = await Promise.all([
        scheduleService.getAll(),
        courseService.getAll(),
        assignmentService.getAll()
      ]);
      setSchedules(schedulesData);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError(err.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const getScheduleForDay = (day) => {
    return schedules.filter(s => s.dayOfWeek === day);
  };

  const getAssignmentsForDay = (day) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const dayIndex = DAYS.indexOf(day);
    const targetDate = addDays(weekStart, dayIndex);
    
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return format(dueDate, "yyyy-MM-dd") === format(targetDate, "yyyy-MM-dd");
    });
  };

  if (schedules.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Weekly Schedule</h1>
          <p className="text-lg text-slate-600">
            View your course schedule and upcoming assignments.
          </p>
        </div>
        <Empty
          title="No schedule yet"
          message="Add courses to automatically generate your weekly schedule"
          icon="Calendar"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Weekly Schedule</h1>
        <p className="text-lg text-slate-600">
          View your course schedule and upcoming assignments.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-6 border-b border-slate-200">
          <div className="p-4 bg-slate-50 font-bold text-slate-700">Time</div>
          {DAYS.map((day) => (
            <div key={day} className="p-4 bg-slate-50 font-bold text-slate-700 text-center">
              {day}
            </div>
          ))}
        </div>

        {TIME_SLOTS.map((time) => (
          <div key={time} className="grid grid-cols-6 border-b border-slate-200 min-h-[80px]">
            <div className="p-4 bg-slate-50 font-medium text-slate-600 text-sm">
              {time}
            </div>
            {DAYS.map((day) => {
              const daySchedules = getScheduleForDay(day);
              const relevantSchedule = daySchedules.find(s => s.startTime === time);
              
              return (
                <div key={`${day}-${time}`} className="p-2 border-l border-slate-200">
                  {relevantSchedule && (() => {
                    const course = courses.find(c => c.Id === relevantSchedule.courseId);
                    return course ? (
                      <Card
                        className="p-3 h-full border-l-4 hover:scale-102 transition-transform duration-200"
                        style={{ borderLeftColor: course.color }}
                      >
                        <p className="font-bold text-sm text-slate-900 mb-1">{course.code}</p>
                        <p className="text-xs text-slate-600 mb-1">{course.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <ApperIcon name="MapPin" size={12} />
                          <span className="truncate">{relevantSchedule.location}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {relevantSchedule.startTime} - {relevantSchedule.endTime}
                        </p>
                      </Card>
                    ) : null;
                  })()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Assignments This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.map((day) => {
            const dayAssignments = getAssignmentsForDay(day);
            
            return (
              <Card key={day} className="p-4">
                <h3 className="font-bold text-slate-900 mb-3">{day}</h3>
                {dayAssignments.length === 0 ? (
                  <p className="text-sm text-slate-500">No assignments</p>
                ) : (
                  <div className="space-y-2">
                    {dayAssignments.map((assignment) => {
                      const course = courses.find(c => c.Id === assignment.courseId);
                      return (
                        <div
                          key={assignment.Id}
                          className="p-2 bg-slate-50 rounded-lg border-l-2"
                          style={{ borderLeftColor: course?.color || "#6366f1" }}
                        >
                          <p className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                            {assignment.title}
                          </p>
                          {course && (
                            <Badge style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                              {course.code}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;