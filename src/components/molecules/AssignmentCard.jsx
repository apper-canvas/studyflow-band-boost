import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const AssignmentCard = ({ assignment, course, onToggle, onEdit, onDelete }) => {
  const isOverdue = new Date(assignment.dueDate) < new Date() && !assignment.completed;
  const dueDate = format(new Date(assignment.dueDate), "MMM dd, yyyy h:mm a");

  const priorityColors = {
    high: "text-error",
    medium: "text-warning",
    low: "text-success"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 border-l-4 ${assignment.completed ? "opacity-60" : ""}`} style={{ borderLeftColor: course?.color || "#6366f1" }}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggle(assignment.Id)}
            className="mt-1 flex-shrink-0"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              assignment.completed 
                ? "bg-success border-success" 
                : "border-slate-300 hover:border-success"
            }`}>
              {assignment.completed && (
                <ApperIcon name="Check" size={16} className="text-white" />
              )}
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${assignment.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                  {assignment.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  {course && (
                    <Badge style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                      {course.code}
                    </Badge>
                  )}
                  <Badge variant={assignment.priority}>
                    <ApperIcon name="AlertCircle" size={12} className={priorityColors[assignment.priority]} />
                    {assignment.priority}
                  </Badge>
                  {assignment.category && (
                    <Badge variant="default">{assignment.category}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(assignment)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <ApperIcon name="Edit2" size={16} className="text-slate-600" />
                </button>
                <button
                  onClick={() => onDelete(assignment.Id)}
                  className="p-2 hover:bg-error/10 rounded-lg transition-colors duration-200"
                >
                  <ApperIcon name="Trash2" size={16} className="text-error" />
                </button>
              </div>
            </div>
            {assignment.description && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {assignment.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <ApperIcon name="Calendar" size={14} className={isOverdue ? "text-error" : "text-slate-500"} />
              <span className={`font-medium ${isOverdue ? "text-error" : "text-slate-700"}`}>
                {dueDate}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
            {assignment.completed && assignment.grade && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Award" size={14} className="text-success" />
                  <span className="text-sm font-semibold text-success">
                    Grade: {assignment.grade}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AssignmentCard;