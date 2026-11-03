/** A stable number between 0 and 1 for an index, so the server and the browser draw the same effect. */
export function seeded(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A DOM safe id from React's useId. */
export const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");
