import { log } from "./logger.js";

/** Status customizados do módulo, adicionados à lista de condições dos tokens. */
const CUSTOM_STATUSES = [
  {
    id: "disguised",
    name: "TOKEN-ATT.Status.disguised",
    img: "icons/svg/mystery-man.svg"
  }
];

/**
 * Registra os status. Roda em `i18nInit` (e não em `init`) porque sistemas como o dnd5e
 * recriam CONFIG.statusEffects nesse hook, apagando o que foi adicionado antes.
 * O hook do módulo é registrado depois do do sistema, então roda depois dele.
 */
export function registerStatuses() {
  Hooks.once("i18nInit", () => {
    for (const status of CUSTOM_STATUSES) {
      if (CONFIG.statusEffects[status.id]) {
        log.debug("Status já existe, ignorado:", status.id);
        continue;
      }
      // CONFIG.statusEffects é um Proxy na v14: atribuir por id também o inclui na lista.
      CONFIG.statusEffects[status.id] = { ...status, name: game.i18n.localize(status.name) };
      log.info("Status registrado:", status.id);
    }
  });
}
