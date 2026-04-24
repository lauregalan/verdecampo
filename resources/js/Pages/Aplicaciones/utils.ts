export const formatDate = (value?: string | null) => {
    if (!value) return "Sin fecha";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const getApiErrorMessage = async (
    response: Response,
    fallback: string,
): Promise<string> => {
    const payload = (await response.json().catch(() => null)) as
        | {
              message?: string;
              errors?: Record<string, string[]>;
          }
        | null;

    const validationMessage = payload?.errors
        ? Object.values(payload.errors).flat()[0]
        : null;

    return validationMessage ?? payload?.message ?? fallback;
};
