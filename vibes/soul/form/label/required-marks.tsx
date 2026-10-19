'use client';

import { createContext, ReactNode, useContext } from 'react';

// Customer forms show a red asterisk on required labels. Forms where every field is required
// anyway (the PDP option picker) opt out so "Finish *" doesn't read as a warning.
const RequiredMarksContext = createContext(true);

export function RequiredMarks({ children, show }: { children: ReactNode; show: boolean }) {
  return <RequiredMarksContext.Provider value={show}>{children}</RequiredMarksContext.Provider>;
}

export function useRequiredMarks() {
  return useContext(RequiredMarksContext);
}
