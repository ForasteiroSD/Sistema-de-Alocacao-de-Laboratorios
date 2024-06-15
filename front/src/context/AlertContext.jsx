import { createContext, useState } from 'react';

/* Consts/Variables */
export const AlertContext = createContext("");

export function AlertProvider({ children }) {
    const [alertType, setAlertType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertState, setAlertState] = useState(false);

    const setAlert = (type, message) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertState(true);
    
        setTimeout(() => {
            setAlertType('');
            setAlertMessage('');
            setAlertState(false);
        }, 5000);
    }

    return (
        <AlertContext.Provider value={{ alertType, alertMessage, alertState, setAlert }} >
            {children}
        </AlertContext.Provider>
    );
}