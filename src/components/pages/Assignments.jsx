import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import AssignmentCard from "@/components/molecules/AssignmentCard";
import AssignmentForm from "@/components/organisms/AssignmentForm";
import FloatingActionButton from "@/components/organisms/FloatingActionButton";
import Modal from "@/components/atoms/Modal";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      if (editingAssignment) {
        await assignmentService.update(editingAssignment.Id, formData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentService.create(formData);
        toast.success("Assignment added successfully!");
      }
      setModalOpen(false);
      setEditingAssignment(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to save assignment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await assignmentService.delete(id);
      toast.success("Assignment deleted successfully!");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete assignment");
    }
  };

  const handleToggle = async (id) => {
    try {
      await assignmentService.toggleComplete(id);
      await loadData();
      toast.success("Assignment status updated!");
    } catch (err) {
      toast.error("Failed to update assignment");
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const filteredAssignments = assignments
    .filter(a => filterCourse === "all" || a.courseId === parseInt(filterCourse))
    .filter(a => {
      if (filterStatus === "all") return true;
      if (filterStatus === "completed") return a.completed;
      if (filterStatus === "pending") return !a.completed;
      if (filterStatus === "overdue") return !a.completed && new Date(a.dueDate) < new Date();
      return true;
    })
    .filter(a => filterPriority === "all" || a.priority === filterPriority)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Assignments</h1>
        <p className="text-lg text-slate-600">
          Track and manage all your course assignments in one place.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <ApperIcon name="Filter" size={20} className="text-slate-600" />
          <h3 className="font-bold text-slate-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Course"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.Id} value={course.Id}>
                {course.code} - {course.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select
            label="Priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <Empty
          title={assignments.length === 0 ? "No assignments yet" : "No assignments match your filters"}
          message={assignments.length === 0 ? "Add your first assignment to start tracking your coursework" : "Try adjusting your filter settings"}
          icon="ClipboardList"
          action={assignments.length === 0 ? {
            label: "Add Assignment",
            icon: "Plus",
            onClick: handleAdd
          } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const course = courses.find(c => c.Id === assignment.courseId);
            return (
              <AssignmentCard
                key={assignment.Id}
                assignment={assignment}
                course={course}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      <FloatingActionButton onClick={handleAdd} />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAssignment(null);
        }}
        title={editingAssignment ? "Edit Assignment" : "Add New Assignment"}
      >
        <AssignmentForm
          initialData={editingAssignment}
          courses={courses}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingAssignment(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Assignments;