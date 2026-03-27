const getCookieValue = (name: string) => {
    const cookies = document.cookie ? document.cookie.split("; ") : [];

    for (const cookie of cookies) {
        const [key, ...valueParts] = cookie.split("=");

        if (key === name) {
            return decodeURIComponent(valueParts.join("="));
        }
    }

    return null;
};

export const getCsrfToken = () =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content") ??
    "";

export const getXsrfToken = () => getCookieValue("XSRF-TOKEN") ?? "";
