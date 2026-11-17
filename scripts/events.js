import { MODULE_ID } from "./constants.js";
import { log } from "./logger.js";

export { MODULE_ID };

/** Grupos e eventos que possuem uma imagem de token. Ordem = ordem na tela. */
export const EVENT_GROUPS = [
  { id: "combat", events: ["calm", "alert"] },
  { id: "hp", events: ["hp75", "hp50", "hp25", "unconscious"] },
  { id: "status", events: ["disguised", "frightened", "charmed", "invisible"] }
];

/** Lê as imagens salvas no ator: { calm: "caminho", ... } */
export function getImages(actor) {
  const images = actor.getFlag(MODULE_ID, "images") ?? {};
  log.debug("getImages", actor.name, images);
  return images;
}
