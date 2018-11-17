export default {
  get: (key, defaultValue = []) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || defaultValue;
    } catch (err) {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // nothing
    }
  },
};
