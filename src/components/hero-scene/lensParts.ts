/**
 * The web GLB is merged by material, so lens parts can't be isolated by mesh
 * name. Reflection boosts key off the material family instead.
 */
export function isMetalPartName(name: string): boolean {
  return name.toLowerCase().includes("metal");
}

export function isGlassPartName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("glass") || lower.includes("lenses_misc");
}
