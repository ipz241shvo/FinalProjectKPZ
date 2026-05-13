import { BaseQrStrategy } from "./BaseQrStrategy.js";
import { isValidUrl } from "../validators/validators.js";

const USERNAME_MAX_LENGTH = 64;
const USERNAME_INVALID_CHARS_REGEX = /[\s<>"]/;

const NETWORK_URL_MAP = {
  telegram: (u) => `https://t.me/${u}`,
  instagram: (u) => `https://instagram.com/${u}`,
  linkedin: (u) => `https://linkedin.com/in/${u}`,
  github: (u) => `https://github.com/${u}`,
  tiktok: (u) => `https://tiktok.com/@${u}`,
};

const NETWORK_PREFIX_LIST = [
  { prefix: "https://t.me/", network: "telegram" },
  { prefix: "https://instagram.com/", network: "instagram" },
  { prefix: "https://linkedin.com/in/", network: "linkedin" },
  { prefix: "https://github.com/", network: "github" },
  { prefix: "https://tiktok.com/@", network: "tiktok" },
];

export class SocialQrStrategy extends BaseQrStrategy {
  static getSocialUrl(network, username) {
    const clean = String(username || "").replace(/^@/, "").trim();
    if (!clean) return "";
    const builder = NETWORK_URL_MAP[network];
    return builder ? builder(clean) : "";
  }

  static detectNetworkFromUrl(url) {
    for (const entry of NETWORK_PREFIX_LIST) {
      if (String(url).startsWith(entry.prefix)) {
        return {
          network: entry.network,
          username: url.slice(entry.prefix.length),
        };
      }
    }
    return { network: "telegram", username: url };
  }

  buildPayload(formData) {
    const network = formData.socialNetwork;
    const username = formData.socialUsername;
    const url = SocialQrStrategy.getSocialUrl(network, username);
    return { payload: url, displayValue: url };
  }

  validate(formData) {
    return this.require(formData, 'socialUsername', "Введіть нікнейм.") ||
        this.limit(formData.socialUsername, 64, "Нікнейм") ||
        this.matches(formData.socialUsername, /^[^\s<>"]+$/, "Нікнейм містить заборонені символи.");
  }

  sanitize(formData) {
    const username = formData.socialUsername;
    if (!username) return formData;
    const cleaned = String(username).replace(/^@/, "").trim();
    return { ...formData, socialUsername: cleaned };
  }

  parsePayload(rawPayload) {
    const detected = SocialQrStrategy.detectNetworkFromUrl(rawPayload || "");
    return {
      socialNetwork: detected.network,
      socialUsername: detected.username,
    };
  }

  getLabel() {
    return "Соцмережі";
  }

  getOpenLink(payload) {
    if (isValidUrl(payload)) return payload;
    return null;
  }
}
