import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", 
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#8b5cf6"
];

const CourseForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    color: PRESET_COLORS[0],
    targetGrade: 90,
    creditHours: 3,
    gradeCategories: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Course Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Introduction to Computer Science"
          required
        />
        <Input
          label="Course Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          placeholder="e.g., CS 101"
          required
        />
      </div>

      <Input
        label="Instructor"
        value={formData.instructor}
        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
        placeholder="e.g., Dr. Sarah Mitchell"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Target Grade (%)"
          type="number"
          value={formData.targetGrade}
          onChange={(e) => setFormData({ ...formData, targetGrade: parseInt(e.target.value) || 0 })}
          min="0"
          max="100"
          required
        />
        <Input
          label="Credit Hours"
          type="number"
          value={formData.creditHours}
          onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) || 0 })}
          min="1"
          max="6"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Course Color
        </label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-12 h-12 rounded-lg transition-all duration-200 ${
                formData.color === color
                  ? "ring-4 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <ApperIcon name="Save" size={18} />
          {initialData ? "Update Course" : "Add Course"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;