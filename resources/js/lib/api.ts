/**
 * API helper for making authenticated requests with proper CSRF/XSRF token handling
 * Works with Laravel Sanctum for SPA authentication
 */

/**
 * Get XSRF token from cookies
 */
export const getXsrfToken = (): string | null => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Get CSRF token from meta tag
 */
export const getCsrfToken = (): string | null => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : null;
};

/**
 * Enhanced fetch with automatic credentials and XSRF token handling
 */
export const apiFetch = async (
    url: string,
    options: RequestInit = {},
): Promise<Response> => {
    const xsrfToken = getXsrfToken();

    const headers = new Headers(options.headers || {});

    // Set default headers
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    if (!headers.has("Content-Type") && options.body) {
        headers.set("Content-Type", "application/json");
    }

    // Add XSRF token if available
    if (xsrfToken) {
        headers.set("X-XSRF-TOKEN", xsrfToken);
    }

    // Add CSRF token for non-GET requests
    const csrfToken = getCsrfToken();
    if (csrfToken && options.method && options.method.toUpperCase() !== "GET") {
        headers.set("X-CSRF-TOKEN", csrfToken);
    }

    // Merge options with defaults
    const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: "same-origin", // Include cookies for same-origin requests
    };

    return fetch(url, fetchOptions);
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
    get: (url: string, options: RequestInit = {}) =>
        apiFetch(url, { ...options, method: "GET" }),

    post: (url: string, data?: any, options: RequestInit = {}) =>
        apiFetch(url, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: (url: string, data?: any, options: RequestInit = {}) =>
        apiFetch(url, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: (url: string, data?: any, options: RequestInit = {}) =>
        apiFetch(url, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: (url: string, options: RequestInit = {}) =>
        apiFetch(url, { ...options, method: "DELETE" }),
};

/**
 * Initialize CSRF cookie by calling /sanctum/csrf-cookie endpoint
 * Call this before making the first authenticated request
 */
export const initCsrfCookie = async (): Promise<void> => {
    try {
        await fetch("/sanctum/csrf-cookie", {
            credentials: "same-origin",
        });
    } catch (error) {
        console.error("Failed to initialize CSRF cookie:", error);
    }
};

export default api;
