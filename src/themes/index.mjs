// Theme registry. A theme is { id, name, description, accent, fonts, order?,
// side?, labels?, render(ctx), css(ctx) }; see README "Writing a theme".
import aurora from "./aurora.mjs";
import executive from "./executive.mjs";
import minimal from "./minimal.mjs";
import noir from "./noir.mjs";
import terminal from "./terminal.mjs";

export const THEMES = [aurora, minimal, executive, noir, terminal];

export const themeIds = THEMES.map((theme) => theme.id);

export const getTheme = (id) => {
   const theme = THEMES.find((t) => t.id === id);
   if (!theme) throw new Error(`Unknown theme "${id}". Available: ${themeIds.join(", ")}.`);
   return theme;
};
