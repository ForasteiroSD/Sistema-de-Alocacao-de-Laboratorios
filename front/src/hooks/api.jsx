import Axios from 'axios';

const callApi = async (route, method, body = null) => {

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL

  try {
    let response;
    if (method === 'post') {
      response = (await Axios.post(backendUrl + route, body)).data;
    } else if (method === 'patch') {
      response = (await Axios.patch(backendUrl + route, body)).data;
    } else if (method === 'delete') {
      response = (await Axios.delete(backendUrl + route, body)).data;
    } else {
      response = (await Axios.get(backendUrl + route, {
        params: body
      })).data;
    }

    return response;

  } catch (e) {
    return e.response.data;
  }
};

export default callApi;