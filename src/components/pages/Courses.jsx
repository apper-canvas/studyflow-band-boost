import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { courseService } from "@/services/api/courseService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import CourseCard from "@/components/molecules/CourseCard";
import CourseForm from "@/components/organisms/CourseForm";
import FloatingActionButton from "@/components/organisms/FloatingActionButton";
import Modal from "@/components/atoms/Modal";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.Id, formData);
        toast.success("Course updated successfully!");
      } else {
        await courseService.create(formData);
        toast.success("Course added successfully!");
      }
      setModalOpen(false);
      setEditingCourse(null);
      await loadCourses();
    } catch (err) {
      toast.error("Failed to save course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    
    try {
      await courseService.delete(id);
      toast.success("Course deleted successfully!");
      await loadCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadCourses} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Courses</h1>
        <p className="text-lg text-slate-600">
          Manage your course schedule and academic workload.
        </p>
      </div>

      {courses.length === 0 ? (
        <Empty
          title="No courses yet"
          message="Add your first course to get started with tracking your academic progress"
          icon="BookOpen"
          action={{
            label: "Add Course",
            icon: "Plus",
            onClick: handleAdd
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.Id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <FloatingActionButton onClick={handleAdd} />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCourse(null);
        }}
        title={editingCourse ? "Edit Course" : "Add New Course"}
      >
        <CourseForm
          initialData={editingCourse}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingCourse(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Courses;