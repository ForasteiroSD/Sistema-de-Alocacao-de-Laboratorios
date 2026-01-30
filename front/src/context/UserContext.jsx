// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

/* Lib */
import api from '../lib/Axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({loading: true});

  useEffect(() => {
    const userData = Cookies.get('user');

    if (!userData) logout()
    else {
      setUser({id: userData, loading: true});
      async function buscaDados() {
        try {
          const response = (await api.get('user/data', {
            params: {
              id: userData,
              saveContext: 1
            }
          })).data;

          response.id = userData;
          response.loading = false;
          setUser(response);

        } catch (error) {
          logout();
        }
      }

      buscaDados();
    }
  }, []);

  const login = (userData) => {
    userData.loading = false;
    setUser(userData);
    Cookies.set('user', userData.id, { expires: 30 });
  };

  const logout = async () => {
    await api.get("user/logout");
    setUser(null);
    Cookies.remove('user');
    Cookies.remove('jwtToken');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
