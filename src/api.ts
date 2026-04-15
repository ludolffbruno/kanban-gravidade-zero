import axios from "axios";

const API_URL = "/api";

// Tasks
export const getTasks = () => axios.get(`${API_URL}/tasks`);
export const createTask = (task: any) => axios.post(`${API_URL}/tasks`, task);
export const updateTask = (id: number, task: any) => axios.put(`${API_URL}/tasks/${id}`, task);
export const deleteTask = (id: number) => axios.delete(`${API_URL}/tasks/${id}`);

// Columns
export const getColumns = () => axios.get(`${API_URL}/columns`);
export const createColumn = (column: any) => axios.post(`${API_URL}/columns`, column);
export const updateColumn = (id: number, column: any) => axios.put(`${API_URL}/columns/${id}`, column);
export const deleteColumn = (id: number) => axios.delete(`${API_URL}/columns/${id}`);

// Categories
export const getCategories = () => axios.get(`${API_URL}/categories`);
