import { log } from "./logger.js";

/** Status customizados do módulo, adicionados à lista de condições dos tokens. */
const CUSTOM_STATUSES = [
  {
    id: "disguised",
    name: "TOKEN-ATT.Status.disguised",
    img: "icons/svg/mystery-man.svg"
  }
];

/** Deve rodar no hook `init`, antes de a lista de condições ser usada. */
export function registerStatuses() {
  const list = CONFIG.statusEffects;
  if (!Array.isArray(list)) {
    log.warn("CONFIG.statusEffects não é um array; status customizados não registrados");
    return;
  }
  for (const status of CUSTOM_STATUSES) {
    if (list.some(s => s.id === status.id)) {
      log.debug("Status já existe, ignorado:", status.id);
      continue;
    }
    list.push(status);
    log.info("Status registrado:", status.id);
  }
}
