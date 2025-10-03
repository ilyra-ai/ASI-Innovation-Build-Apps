const FALLBACK = "[DATA]\nTODAY_ISO=YYYY-MM-DD\nTZ=America/Sao_Paulo";

const getTimeZone = () => {
  try {
    const intlZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (intlZone && intlZone.trim().length > 0) {
      return intlZone;
    }
  } catch {}
  if (process.env.TZ && process.env.TZ.trim().length > 0) {
    return process.env.TZ;
  }
  return undefined;
};

export const buildDateContext = () => {
  try {
    const now = new Date();
    if (Number.isNaN(now.getTime())) {
      return FALLBACK;
    }
    const timeZone = getTimeZone() ?? "America/Sao_Paulo";
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formatted = formatter.format(now);
    return `[DATA]\nTODAY_ISO=${formatted}\nTZ=${timeZone}`;
  } catch {
    return FALLBACK;
  }
};
