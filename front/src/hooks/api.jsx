import { useState } from 'react';
 
const useApi = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
 
  const callApi = async (route, method, body = null) => {
    setLoading(true);
    setError(null);
    setData(null);
 
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // Aqui você pode adicionar outros headers necessários, como tokens de autorização, etc.
      },
      body: body ? JSON.stringify(body) : null,
    };
    const url =`${backendUrl}${route}`
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
 
      if (!response.ok) {
        throw new Error(responseData.message || 'Ocorreu um erro na chamada da API');
      }
 
      setData(responseData);
    } catch (error) {
      setError(error.message || 'Ocorreu um erro na chamada da API');
    } finally {
      setLoading(false);
    }
  };
 
  return { loading, error, data, callApi };
};
 
export default useApi;