import isEqual from "lodash/isEqual";
import { ALL_LOCALES, OPENAI_LOCALES } from "./consts";
import { Languages } from "./enums/languages";
import { Language } from "./language";
import { ChatGPT } from "./lib/chat-gpt";
import { Deepl } from "./lib/deepl";

export class Translator {
  private chatGPT = new ChatGPT();
  private deepl = new Deepl();

  private validate(from: string, to: string): boolean {
    const validInterpolations = () => {
      const regex = /{\$[^}]+}/g;
      return isEqual(from.match(regex), to.match(regex));
    };

    return to != null && from != to && validInterpolations();
  }

  private async translate(
    text: string,
    toLocale: Languages,
    fromLocale: Languages
  ): Promise<string | null> {
    const service = OPENAI_LOCALES.includes(toLocale)
      ? this.chatGPT
      : this.deepl;

    let translated = await service.translate(text, toLocale, fromLocale);
    if (!this.validate(text, translated) && service instanceof Deepl) {
      translated = await this.chatGPT.translate(text, toLocale);
    }

    return translated;
  }

  async translateLabel(from: Language, label: string) {
    const text = from.translations[label];
    if (!text) {
      console.log(`Non-existent label provided`);
      return;
    }

    console.log(`Translating '${label}' for all locales`);

    for (const locale of ALL_LOCALES) {
      console.log(`Translating to ${locale}`);

      const to = new Language(locale);

      try {
        const translated = await this.translate(text, to.locale, from.locale);
        if (this.validate(text, translated)) {
          to.translations[label] = translated;
          to.save();
        }
      } catch (e) {
        console.log("Error:", e);
        continue;
      }
    }

    console.log("Done translating label");
  }
}
