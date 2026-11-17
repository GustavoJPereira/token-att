import { MODULE_ID } from "./constants.js";

const PREFIX = `${MODULE_ID} |`;

/** Ativado pela configuração "debug" (cliente). Seguro de chamar antes do init. */
function debugEnabled() {
  try {
    return game.settings.get(MODULE_ID, "debug");
  } catch {
    return false;
  }
}

/**
 * Logger do módulo. Foundry não tem logger próprio para módulos: usa-se o
 * console do navegador (F12) com um prefixo "id-do-modulo |".
 * - debug/info: só aparecem com a configuração "Logs de depuração" ligada.
 * - warn/error: sempre aparecem.
 */
export const log = {
  debug: (...args) => debugEnabled() && console.debug(PREFIX, ...args),
  info: (...args) => debugEnabled() && console.info(PREFIX, ...args),
  warn: (...args) => console.warn(PREFIX, ...args),
  error: (...args) => console.error(PREFIX, ...args)
};

export function registerDebugSetting() {
  game.settings.register(MODULE_ID, "debug", {
    name: "TOKEN-POR-HP.Settings.Debug.Name",
    hint: "TOKEN-POR-HP.Settings.Debug.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
}
