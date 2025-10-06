import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const AssignmentForm = ({ initialData, courses, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    category: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dueDate: format(new Date(initialData.dueDate), "yyyy-MM-dd'T'HH:mm")
      });
    } else if (courses.length > 0) {
      setFormData(prev => ({ ...prev, courseId: courses[0].Id }));
    }
  }, [initialData, courses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      courseId: parseInt(formData.courseId)
    });
  };

  const selectedCourse = courses.find(c => c.Id === parseInt(formData.courseId));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Select
        label="Course"
        value={formData.courseId}
        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
        required
      >
        {courses.map((course) => (
          <option key={course.Id} value={course.Id}>
            {course.code} - {course.name}
          </option>
        ))}
      </Select>

      <Input
        label="Assignment Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., Programming Assignment 1"
        required
      />

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Additional details about the assignment..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Due Date & Time"
          type="datetime-local"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
        />
        <Select
          label="Priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      {selectedCourse && selectedCourse.gradeCategories.length > 0 && (
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Select a category</option>
          {selectedCourse.gradeCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name} ({cat.weight}%)
            </option>
          ))}
        </Select>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <ApperIcon name="Save" size={18} />
          {initialData ? "Update Assignment" : "Add Assignment"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AssignmentForm;