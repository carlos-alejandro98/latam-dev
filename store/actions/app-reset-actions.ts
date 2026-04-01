import { createAction } from '@reduxjs/toolkit';

/**
 * Resets the entire Redux tree to initial state (logout, invalid session, etc.).
 */
export const appResetState = createAction('app/resetState');
