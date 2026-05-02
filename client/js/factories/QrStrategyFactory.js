import { UrlQrStrategy } from "../generators/UrlQrStrategy.js";
import { WifiQrStrategy } from "../generators/WifiQrStrategy.js";
import { EmailQrStrategy } from "../generators/EmailQrStrategy.js";
import { PhoneQrStrategy } from "../generators/PhoneQrStrategy.js";
import { VCardQrStrategy } from "../generators/VCardQrStrategy.js";
import { SmsQrStrategy } from "../generators/SmsQrStrategy.js";
import { GeoQrStrategy } from "../generators/GeoQrStrategy.js";
import { EventQrStrategy } from "../generators/EventQrStrategy.js";
import { SocialQrStrategy } from "../generators/SocialQrStrategy.js";
import { TextQrStrategy } from "../generators/TextQrStrategy.js";

const strategyRegistry = new Map([
  ["url", new UrlQrStrategy()],
  ["wifi", new WifiQrStrategy()],
  ["email", new EmailQrStrategy()],
  ["phone", new PhoneQrStrategy()],
  ["vcard", new VCardQrStrategy()],
  ["sms", new SmsQrStrategy()],
  ["geo", new GeoQrStrategy()],
  ["vevent", new EventQrStrategy()],
  ["social", new SocialQrStrategy()],
  ["text", new TextQrStrategy()],
]);

export class QrStrategyFactory {
  static getStrategy(type) {
    const strategy = strategyRegistry.get(type);
    if (!strategy) return strategyRegistry.get("text");
    return strategy;
  }

  static getAllTypes() {
    return Array.from(strategyRegistry.keys());
  }

  static hasType(type) {
    return strategyRegistry.has(type);
  }
}
