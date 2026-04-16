import axios from "axios";
import { auth } from "./lib/firebase";

const API_URL = "/api";

// Interceptor to add Firebase Token
axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Tasks
export const getTasks = () => axios.get(`${API_URL}/tasks`);
export const createTask = (task: any) => axios.post(`${API_URL}/tasks`, task);
export const updateTask = (id: number, task: any) => axios.put(`${API_URL}/tasks/${id}`, task);
export const deleteTask = (id: number) => axios.delete(`${API_URL}/tasks/${id}`);

// Columns
export const getColumns = () => axios.get(`${API_URL}/columns`);
export const createColumn = (column: any) => axios.post(`${API_URL}/columns`, column);
export const updateColumn = (id: number, column: any) => axios.put(`${API_URL}/columns/${id}`, column);
export const reorderColumns = (orders: {id: number, position: number}[]) => axios.post(`${API_URL}/columns/reorder`, { columnOrders: orders });
export const deleteColumn = (id: number) => axios.delete(`${API_URL}/columns/${id}`);

// Categories
export const getCategories = () => axios.get(`${API_URL}/categories`);

// Initialization
export const initUser = () => axios.post(`${API_URL}/init-user`);
