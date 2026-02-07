import axios from 'axios';

const api = axios.create({
    baseURL : 'http://localhost:5555/api',
    timeout:10000,
    headers:{
        'Content-Type':'application/json',
    },
});

//Add token to every request (after login)
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response?.status === 401){
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default api;