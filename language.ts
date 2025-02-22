import {
  Expose,
  instanceToPlain,
  plainToInstance,
  Type,
} from "class-transformer";
import { readFileSync, writeFileSync } from "fs";
import { LANG_FILE_PATH } from "./consts";
import { Langs } from "./langs";

export class Locale {
  @Expose()
  @Type(() => Object)
  translations: { [key: string]: string };
}

export class Language {
  @Expose()
  @Type(() => String)
  locale: Langs;

  @Expose()
  @Type(() => Object)
  translations: { [key: string]: string };

  constructor(locale: Langs) {
    this.locale = locale;
    this.load();
  }

  private load() {
    const { translations } = plainToInstance(
      Locale,
      JSON.parse(readFileSync(LANG_FILE_PATH(this.locale)).toString())
    );
    this.translations = translations;
  }

  save() {
    writeFileSync(
      LANG_FILE_PATH(this.locale),
      JSON.stringify(instanceToPlain(this), null, "\t")
    );
  }
}
