export const formatDate = (date: string) =>
    new Date(date).toLocaleString("ru", { year: "numeric", month: "numeric", day: "numeric" }).split("г.")[0];
