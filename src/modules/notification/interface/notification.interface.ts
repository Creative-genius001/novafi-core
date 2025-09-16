/* eslint-disable prettier/prettier */
export interface CreateNotification {
    title: string,
    message: string,
    category: 'TRANSACTION' | 'ACTIVITIES',
    type: 'DEPOSIT' | 'TRANSFER' | 'SERVICES',
}