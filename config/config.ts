export const isDev = import.meta.env.MODE === 'development';
export const isProd = import.meta.env.MODE === 'production';
export const isTesting = import.meta.env.MODE === 'testing';
export const browser = import.meta.env.BROWSER