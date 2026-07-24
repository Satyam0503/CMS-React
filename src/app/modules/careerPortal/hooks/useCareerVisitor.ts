import { useMemo } from "react";

const VISITOR_KEY = "career_portal_visitor";
const SESSION_KEY = "career_portal_session";

const createToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export const getCareerVisitorToken = () => {
  let value = localStorage.getItem(VISITOR_KEY);
  if (!value) {
    value = createToken();
    localStorage.setItem(VISITOR_KEY, value);
  }
  return value;
};

export const getCareerSession = () => localStorage.getItem(SESSION_KEY) ?? "";
export const setCareerSession = (token: string) => localStorage.setItem(SESSION_KEY, token);
export const clearCareerSession = () => localStorage.removeItem(SESSION_KEY);

export const useCareerVisitor = () =>
  useMemo(
    () => ({ visitorToken: getCareerVisitorToken(), sessionToken: getCareerSession() }),
    [],
  );
