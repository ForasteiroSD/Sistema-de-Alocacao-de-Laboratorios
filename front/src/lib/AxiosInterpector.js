import { useEffect, useContext } from "react";
import { UserContext } from '../context/UserContext';
import api from "./Axios";

export default function useAxiosInterceptor() {
    const { user, logout } = useContext(UserContext);

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    if(user && !user.loading) {
                        
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [logout]);
}