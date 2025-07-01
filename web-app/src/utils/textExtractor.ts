import type { ReactNode } from 'react';

/**
 * Extract text content from React nodes recursively
 */
export const extractTextFromReactNode = (node: ReactNode): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractTextFromReactNode((node as { props: { children: ReactNode } }).props.children);
  }
  return "";
};

/**
 * Safely convert unknown value to string for display
 */
export const safeStringify = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  return JSON.stringify(value);
};