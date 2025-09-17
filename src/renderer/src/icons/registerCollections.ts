// Registra coleções do Iconify localmente para uso offline
// Importa JSON das coleções usadas e registra via addCollection.

import { addCollection } from "@iconify/react";
import type { IconifyJSON } from "@iconify/types";

// Pacotes JSON das coleções utilizadas no projeto
import mdi from "@iconify-json/mdi/icons.json";
import noto from "@iconify-json/noto/icons.json";
import notoV1 from "@iconify-json/noto-v1/icons.json";
import vscodeIcons from "@iconify-json/vscode-icons/icons.json";
import fluentColor from "@iconify-json/fluent-color/icons.json";
import fluentEmojiFlat from "@iconify-json/fluent-emoji-flat/icons.json";
import logos from "@iconify-json/logos/icons.json";
import eva from "@iconify-json/eva/icons.json";
import lineMd from "@iconify-json/line-md/icons.json";
import iconPark from "@iconify-json/icon-park/icons.json";
import materialIconTheme from "@iconify-json/material-icon-theme/icons.json";
import simpleIcons from "@iconify-json/simple-icons/icons.json";
import ic from "@iconify-json/ic/icons.json";
import streamlineUltimateColor from "@iconify-json/streamline-ultimate-color/icons.json";

// Registra todas as coleções
export function registerIconCollections() {
  // As JSON collections podem não vir tipadas; fazemos cast para IconifyJSON
  addCollection(mdi as unknown as IconifyJSON);
  addCollection(noto as unknown as IconifyJSON);
  addCollection(notoV1 as unknown as IconifyJSON);
  addCollection(vscodeIcons as unknown as IconifyJSON);
  addCollection(fluentColor as unknown as IconifyJSON);
  addCollection(fluentEmojiFlat as unknown as IconifyJSON);
  addCollection(logos as unknown as IconifyJSON);
  addCollection(eva as unknown as IconifyJSON);
  addCollection(lineMd as unknown as IconifyJSON);
  addCollection(iconPark as unknown as IconifyJSON);
  addCollection(materialIconTheme as unknown as IconifyJSON);
  addCollection(simpleIcons as unknown as IconifyJSON);
  addCollection(ic as unknown as IconifyJSON);
  addCollection(streamlineUltimateColor as unknown as IconifyJSON);
}

// Opcional: autoexecutar registro ao importar o módulo
registerIconCollections();
