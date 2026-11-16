import { MODULE_ID } from "./events.js";
import { registerSheetButton } from "./image-config.js";

/* ---------- Configurações ---------- */
Hooks.once("init", () => {
  registerSheetButton();

  game.settings.register(MODULE_ID, "threshold", {
    name: "TOKEN-POR-HP.Settings.Threshold.Name",
    hint: "TOKEN-POR-HP.Settings.Threshold.Hint",
    scope: "world",
    config: true,
    type: Number,
    default: 50,
    range: { min: 1, max: 99, step: 1 }
  });
});

/* ---------- Caminho do HP (ajuste por sistema) ---------- */
function getHP(actor) {
  const hp = actor.system?.attributes?.hp;
  if (!hp || !Number.isFinite(hp.max) || hp.max <= 0) return null;
  return { value: hp.value, max: hp.max };
}

/* ---------- Artes: guardadas em flags do ator ---------- */
function getArt(actor) {
  const healthy = actor.getFlag(MODULE_ID, "healthy");
  const wounded = actor.getFlag(MODULE_ID, "wounded");
  return healthy && wounded ? { healthy, wounded } : null;
}

/* ---------- Lógica central ---------- */
async function refreshToken(tokenDoc) {
  const actor = tokenDoc.actor;
  if (!actor) return;
  const art = getArt(actor);
  const hp = getHP(actor);
  if (!art || !hp) return;

  const pct = (hp.value / hp.max) * 100;
  const threshold = game.settings.get(MODULE_ID, "threshold");
  const wanted = pct <= threshold ? art.wounded : art.healthy;

  if (tokenDoc.texture.src !== wanted) {
    await tokenDoc.update({ "texture.src": wanted });
  }
}

function hpChanged(changed) {
  return foundry.utils.hasProperty(changed, "system.attributes.hp");
}

/* ---------- Hooks ---------- */
// Tokens vinculados: o HP muda no Actor.
Hooks.on("updateActor", (actor, changed) => {
  if (!game.user.isActiveGM || !hpChanged(changed)) return;
  for (const tokenDoc of actor.getDependentTokens()) refreshToken(tokenDoc);
});

// Tokens não vinculados: o HP muda no delta do token.
Hooks.on("updateToken", (tokenDoc, changed) => {
  if (!game.user.isActiveGM) return;
  if (!foundry.utils.hasProperty(changed, "delta.system.attributes.hp")) return;
  refreshToken(tokenDoc);
});
