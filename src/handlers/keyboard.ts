export function getTimezoneKeyboard(timezones: string[], lang: string) {
  if (timezones.length === 0) {
    return [
      [{ text: lang === "th" ? "กรุงเทพฯ 🇹🇭" : "Bangkok 🇹🇭" }, { text: lang === "th" ? "โตเกียว 🇯🇵" : "Tokyo 🇯🇵" }],
      [{ text: lang === "th" ? "ลอนดอน 🇬🇧" : "London 🇬🇧" }]
    ];
  }

  const rows = [];
  for (let i = 0; i < timezones.length; i += 2) {
    const row = timezones.slice(i, i + 2).map(zone => ({
      text: `${zone} ${zone.includes("Bangkok") ? "🇹🇭" : zone.includes("Tokyo") ? "🇯🇵" : "🌍"}`
    }));
    rows.push(row);
  }

  return rows;
}