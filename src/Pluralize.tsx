export function pluralize(name: string): string {
  if (!name) return "";

  const lower = name.toLowerCase();

  // Irregular plurals used in your Swagger
  const irregular: Record<string, string> = {
    person: "people",
    man: "men",
    child: "children",
    taxgroupcomponent: "taxgroupcomponents",
    chartofaccounts: "chartofaccounts", // already plural
    generalledger: "generalledger", // not real plural
  };

  if (irregular[lower]) {
    return irregular[lower];
  }

  // If it already ends with "s", assume it's already plural
  if (lower.endsWith("s")) {
    return name;
  }

  // Words ending in consonant + y  →  ies
  if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(name)) {
    return name.replace(/y$/i, "ies");
  }

  // Words ending in s, x, ch, sh → add "es"
  if (/(s|x|ch|sh)$/i.test(name)) {
    return name + "es";
  }

  // Words ending in f/fe → ves
  if (/fe?$/i.test(name)) {
    return name.replace(/fe?$/i, "ves");
  }

  // Words ending in "Item" → "Items"
  if (name.toLowerCase().endsWith("item")) {
    return name + "s";
  }

  // Default rule → add “s”
  return name + "s";
}
