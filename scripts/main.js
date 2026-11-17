import { MODULE_ID } from "./events.js";
import { registerSheetButton } from "./image-config.js";
import { log, registerDebugSetting } from "./logger.js";

/* ---------- Configurações ---------- */
Hooks.once("init", () => {
  registerDebugSetting();
  log.info("init");
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
  if (!hp || !Number.isFinite(hp.max) || hp.max <= 0) {
    log.debug("getHP: sem HP válido em", actor.name, hp);
    return null;
  }
  return { value: hp.value, max: hp.max };
}

/* ---------- Artes: guardadas em flags do ator ---------- */
function getArt(actor) {
  const healthy = actor.getFlag(MODULE_ID, "healthy");
  const wounded = actor.getFlag(MODULE_ID, "wounded");
  if (!(healthy && wounded)) {
    log.debug("getArt: artes não definidas em", actor.name);
    return null;
  }
  return { healthy, wounded };
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

  log.debug("refreshToken", tokenDoc.name, { pct, threshold, wanted });
  if (tokenDoc.texture.src !== wanted) {
    log.info("Trocando arte de", tokenDoc.name, "para", wanted);
    try {
      await tokenDoc.update({ "texture.src": wanted });
    } catch (err) {
      log.error("Falha ao atualizar token", tokenDoc.name, err);
    }
  } else {
    log.debug("Arte já correta, nada a fazer:", tokenDoc.name);
  }
}

function hpChanged(changed) {
  const result = foundry.utils.hasProperty(changed, "system.attributes.hp");
  log.debug("hpChanged", result);
  return result;
}

/* ---------- Hooks ---------- */
// Tokens vinculados: o HP muda no Actor.
Hooks.on("updateActor", (actor, changed) => {
  log.debug("hook updateActor", actor.name, changed);
  if (!game.user.isActiveGM || !hpChanged(changed)) return;
  for (const tokenDoc of actor.getDependentTokens()) refreshToken(tokenDoc);
});

// Tokens não vinculados: o HP muda no delta do token.
Hooks.on("updateToken", (tokenDoc, changed) => {
  log.debug("hook updateToken", tokenDoc.name, changed);
  if (!game.user.isActiveGM) return;
  if (!foundry.utils.hasProperty(changed, "delta.system.attributes.hp")) return;
  refreshToken(tokenDoc);
});
