// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = Cookies.get('user');
    if (userData) {
      setUser(userData);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    console.log(userData)
    Cookies.set('user', userData.id, { expires: 30 });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
