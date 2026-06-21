import type { MenuItem } from "@/types";
import type { Locale } from "@/lib/i18n/translations";

export function localizedName(item: Pick<MenuItem, "name" | "translations">, locale: Locale): string {
  if (locale === "th") return item.name;
  return item.translations?.[locale]?.name || item.name;
}

export function localizedDesc(item: Pick<MenuItem, "description" | "translations">, locale: Locale): string | undefined {
  if (locale === "th") return item.description;
  return item.translations?.[locale]?.description || item.description;
}
