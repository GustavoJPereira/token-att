import { getImages } from "./events.js";
import { log } from "./logger.js";

/**
 * Prioridade dos eventos, da MAIOR para a MENOR (inverso do CONCEITO.md):
 * invisível < disfarçado < normal < combate < HP (75 < 50 < 25) < assustado, encantado < inconsciente
 */
export const PRIORITY = [
  "unconscious",
  "frightened",
  "charmed",
  "hp25",
  "hp50",
  "hp75",
  "alert",
  "calm",
  "disguised",
  "invisible"
];

/** Ids dos status (condições) do Foundry que ativam cada evento de status. */
export const STATUS_IDS = {
  unconscious: ["unconscious"],
  frightened: ["frightened"],
  charmed: ["charmed", "stunned"], // atordoado usa a imagem de encantado
  disguised: ["disguised"],
  invisible: ["invisible"]
};

/** HP do ator: { value, max } ou null se o sistema não tiver HP válido. (dnd5e/pf2e: system.attributes.hp) */
export function getHP(actor) {
  const hp = actor.system?.attributes?.hp;
  if (!hp || !Number.isFinite(hp.value) || !Number.isFinite(hp.max) || hp.max <= 0) {
    log.debug("getHP: sem HP válido em", actor.name, hp);
    return null;
  }
  return { value: hp.value, max: hp.max };
}

/** O token está em um combate já iniciado? */
function isInCombat(tokenDoc) {
  return Boolean(tokenDoc.inCombat && tokenDoc.combatant?.combat?.started);
}

/**
 * Eventos ativos para um token. Retorna um Set de chaves (ver events.js).
 * Retorna um Set vazio se o token não tiver ator.
 */
export function getActiveEvents(tokenDoc) {
  const active = new Set();
  const actor = tokenDoc?.actor;
  if (!actor) {
    log.debug("getActiveEvents: token sem ator", tokenDoc?.name);
    return active;
  }

  // Combate: "alerta" em combate, "tranquilo" fora dele.
  active.add(isInCombat(tokenDoc) ? "alert" : "calm");

  // HP
  const hp = getHP(actor);
  if (hp) {
    const pct = (hp.value / hp.max) * 100;
    if (hp.value <= 0) active.add("unconscious");
    if (pct < 25) active.add("hp25");
    if (pct < 50) active.add("hp50");
    if (pct < 75) active.add("hp75");
  }

  // Status (condições)
  for (const [event, statusIds] of Object.entries(STATUS_IDS)) {
    if (statusIds.some(id => actor.statuses?.has(id))) active.add(event);
  }

  return active;
}

/**
 * Decide a imagem do token: o evento ativo de maior prioridade QUE TENHA imagem.
 * @returns {{event: string, src: string}|null} null se nada se aplica (token sem ator ou sem imagens).
 */
export function resolveImage(tokenDoc) {
  const actor = tokenDoc?.actor;
  if (!actor) return null;

  const images = getImages(actor);
  const active = getActiveEvents(tokenDoc);

  for (const event of PRIORITY) {
    if (active.has(event) && images[event]) {
      log.debug("resolveImage", tokenDoc.name, "->", event, images[event]);
      return { event, src: images[event] };
    }
  }
  log.debug("resolveImage: nenhuma imagem aplicável para", tokenDoc.name, [...active]);
  return null;
}
