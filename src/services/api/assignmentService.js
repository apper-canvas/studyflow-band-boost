import assignmentsData from "../mockData/assignments.json";

const STORAGE_KEY = "studyflow_assignments";

const getStoredAssignments = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : assignmentsData;
};

const saveAssignments = (assignments) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const assignmentService = {
  async getAll() {
    await delay();
    return [...getStoredAssignments()];
  },

  async getById(id) {
    await delay();
    const assignments = getStoredAssignments();
    const assignment = assignments.find((a) => a.Id === parseInt(id));
    return assignment ? { ...assignment } : null;
  },

  async getByCourseId(courseId) {
    await delay();
    const assignments = getStoredAssignments();
    return assignments.filter((a) => a.courseId === parseInt(courseId));
  },

  async create(assignment) {
    await delay();
    const assignments = getStoredAssignments();
    const maxId = assignments.reduce((max, a) => Math.max(max, a.Id), 0);
    const newAssignment = {
      ...assignment,
      Id: maxId + 1,
      completed: false,
      grade: null
    };
    assignments.push(newAssignment);
    saveAssignments(assignments);
    return { ...newAssignment };
  },

  async update(id, data) {
    await delay();
    const assignments = getStoredAssignments();
    const index = assignments.findIndex((a) => a.Id === parseInt(id));
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...data };
      saveAssignments(assignments);
      return { ...assignments[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const assignments = getStoredAssignments();
    const filtered = assignments.filter((a) => a.Id !== parseInt(id));
    saveAssignments(filtered);
    return true;
  },

  async toggleComplete(id) {
    await delay();
    const assignments = getStoredAssignments();
    const index = assignments.findIndex((a) => a.Id === parseInt(id));
    if (index !== -1) {
      assignments[index].completed = !assignments[index].completed;
      saveAssignments(assignments);
      return { ...assignments[index] };
    }
    return null;
  }
};