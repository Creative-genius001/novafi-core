/* eslint-disable prettier/prettier */
const config = {
    SMTP_USERNAME: process.env.SMTP_USER_NAME as string,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SUMSUB_BASE_URL: process.env.SUMSUB_BASE_URL as string,
    SUMSUB_API_TOKEN: process.env.SUMSUB_API_TOKEN as string,
    SUMSUB_API_SECRET: process.env.SUMSUB_API_SECRET as string,
} as const

export { config };