import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

// Automatically include CSRF token in all Axios requests
window.axios.interceptors.request.use(
    (config) => {
        // Get XSRF token from cookie
        const xsrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];

        if (xsrfToken) {
            config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
