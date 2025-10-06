import schedulesData from "../mockData/schedules.json";

const STORAGE_KEY = "studyflow_schedules";

const getStoredSchedules = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : schedulesData;
};

const saveSchedules = (schedules) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export const scheduleService = {
  async getAll() {
    await delay();
    return [...getStoredSchedules()];
  },

  async getByCourseId(courseId) {
    await delay();
    const schedules = getStoredSchedules();
    return schedules.filter((s) => s.courseId === parseInt(courseId));
  },

  async create(schedule) {
    await delay();
    const schedules = getStoredSchedules();
    const maxId = schedules.reduce((max, s) => Math.max(max, s.Id), 0);
    const newSchedule = {
      ...schedule,
      Id: maxId + 1
    };
    schedules.push(newSchedule);
    saveSchedules(schedules);
    return { ...newSchedule };
  },

  async delete(id) {
    await delay();
    const schedules = getStoredSchedules();
    const filtered = schedules.filter((s) => s.Id !== parseInt(id));
    saveSchedules(filtered);
    return true;
  }
};