export const MODULE_ID = "token-por-hp";

/** Grupos e eventos que possuem uma imagem de token. Ordem = ordem na tela. */
export const EVENT_GROUPS = [
  { id: "combat", events: ["calm", "alert"] },
  { id: "hp", events: ["hp75", "hp50", "hp25", "unconscious"] },
  { id: "status", events: ["disguised", "frightened", "charmed", "invisible"] }
];

/** Lê as imagens salvas no ator: { calm: "caminho", ... } */
export function getImages(actor) {
  return actor.getFlag(MODULE_ID, "images") ?? {};
}
