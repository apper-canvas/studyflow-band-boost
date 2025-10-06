import coursesData from "../mockData/courses.json";

const STORAGE_KEY = "studyflow_courses";

const getStoredCourses = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : coursesData;
};

const saveCourses = (courses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const courseService = {
  async getAll() {
    await delay();
    return [...getStoredCourses()];
  },

  async getById(id) {
    await delay();
    const courses = getStoredCourses();
    const course = courses.find((c) => c.Id === parseInt(id));
    return course ? { ...course } : null;
  },

async create(course) {
    await delay();
    const courses = getStoredCourses();
    const maxId = courses.reduce((max, c) => Math.max(max, c.Id), 0);
    const newCourse = {
      ...course,
      Id: maxId + 1,
      gradeCategories: course.gradeCategories || [],
      semester: course.semester || null,
      credits: course.credits || 3
    };
    courses.push(newCourse);
    saveCourses(courses);
    return { ...newCourse };
  },

async update(id, data) {
    await delay();
    const courses = getStoredCourses();
    const index = courses.findIndex((c) => c.Id === parseInt(id));
    if (index !== -1) {
      courses[index] = { 
        ...courses[index], 
        ...data,
        semester: data.semester !== undefined ? data.semester : courses[index].semester,
        credits: data.credits !== undefined ? data.credits : courses[index].credits || 3
      };
      saveCourses(courses);
      return { ...courses[index] };
    }
    return null;
  },

  async delete(id) {
    await delay();
    const courses = getStoredCourses();
    const filtered = courses.filter((c) => c.Id !== parseInt(id));
    saveCourses(filtered);
    return true;
  }
};