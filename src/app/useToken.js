import { useState } from 'react';

export default function useToken() {
    const getToken = () => {
        const tokenString = localStorage.getItem('token');
        const parsedToken = JSON.parse(tokenString);
        return parsedToken?.token;
    };

    const [token, setToken] = useState(getToken());

    const saveToken = userToken => {
        localStorage.setItem('token', JSON.stringify(userToken));
        localStorage.setItem('user', userToken.user);
        setToken(userToken.token);
    };

    return {
        setToken: saveToken,
        token
    };
}