export function escapeWifiValue(value) {
  return String(value).replace(/([\;,:"\\])/g, "\\$1");
}

export function unescapeWifiValue(value) {
  return String(value || "").replace(/\\([\\;,:"\\])/g, "$1");
}

export function parseWifiPayload(payload) {
  const result = { ssid: "", password: "", security: "WPA", hidden: false };
  const trimmed = String(payload || "");

  const ssidMatch = trimmed.match(/(?:^|;)S:((?:\\.|[^;])*)/);
  const passwordMatch = trimmed.match(/(?:^|;)P:((?:\\.|[^;])*)/);
  const securityMatch = trimmed.match(/(?:^|;)T:((?:\\.|[^;])*)/);
  const hiddenMatch = trimmed.match(/(?:^|;)H:((?:\\.|[^;])*)/);

  if (ssidMatch) result.ssid = unescapeWifiValue(ssidMatch[1]);
  if (passwordMatch) result.password = unescapeWifiValue(passwordMatch[1]);
  if (securityMatch) result.security = unescapeWifiValue(securityMatch[1]) || "WPA";
  if (hiddenMatch) result.hidden = unescapeWifiValue(hiddenMatch[1]) === "true";

  return result;
}
