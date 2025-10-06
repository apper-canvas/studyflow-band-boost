import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const CourseCard = ({ course, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
    >
      <Card className="p-6 border-l-4 cursor-pointer" style={{ borderLeftColor: course.color }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1" onClick={() => navigate(`/courses/${course.Id}`)}>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{course.name}</h3>
            <p className="text-sm font-semibold text-slate-500 mb-2">{course.code}</p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ApperIcon name="User" size={14} />
              <span>{course.instructor}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="Edit2" size={18} className="text-slate-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.Id);
              }}
              className="p-2 hover:bg-error/10 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="Trash2" size={18} className="text-error" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <ApperIcon name="Award" size={16} className="text-slate-500" />
              <span className="font-semibold text-slate-700">{course.creditHours} credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ApperIcon name="Target" size={16} className="text-slate-500" />
              <span className="font-semibold text-slate-700">Target: {course.targetGrade}%</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CourseCard;