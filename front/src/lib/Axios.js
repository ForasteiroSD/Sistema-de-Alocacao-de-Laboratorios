import Axios from "axios";

const api = Axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_BACKEND_URL
});

export default api;