import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getTasks = () => axios.get(`${API_URL}/tasks`);
export const getCategories = () => axios.get(`${API_URL}/categories`);
export const createTask = (task: any) => axios.post(`${API_URL}/tasks`, task);
export const updateTask = (id: number, task: any) => axios.put(`${API_URL}/tasks/${id}`, task);
export const deleteTask = (id: number) => axios.delete(`${API_URL}/tasks/${id}`);
export const getComments = (taskId: number) => axios.get(`${API_URL}/tasks/${taskId}/comments`);
export const addComment = (taskId: number, content: string) => axios.post(`${API_URL}/tasks/${taskId}/comments`, { content });
