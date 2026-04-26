import { callProcedure } from "../utils/procedureClient";

export const fetchAllThemes = async () => {
  return await callProcedure("sp_thememanager", "'GetAll'");
};

export const saveTheme = async (theme: any) => {
  const action = theme.ThemeId ? "Update" : "Create";
  const params = [
    `'${action}'`,
    theme.ThemeId ?? "NULL",
    `'${theme.ThemeName ?? ""}'`,
    `'${theme.PrimaryColor ?? ""}'`,
    `'${theme.BackgroundColor ?? ""}'`,
    `'${theme.TextColor ?? ""}'`,
    `'${theme.CardColor ?? ""}'`,
    `'${theme.SidebarBg ?? ""}'`,
    `'${theme.ChartColor ?? ""}'`,
    theme.IsDefault ?? 0
  ].join(",");

  return await callProcedure("sp_thememanager", params);
};

export const deleteTheme = async (themeId: number) => {
  const params = [`'Delete'`, themeId].join(",");
  return await callProcedure("sp_thememanager", params);
};
