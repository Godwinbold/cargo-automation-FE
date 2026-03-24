const GetFromLocalStorage = (name) => {
  const data = localStorage.getItem(name);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

export { GetFromLocalStorage };

const SaveToLocalStorage = (name, data) => {
  localStorage.setItem(name, JSON.stringify(data));
};

export { SaveToLocalStorage };

const RemoveFromLocalStorage = (name) => {
  localStorage.removeItem(name);
};

export { RemoveFromLocalStorage };
