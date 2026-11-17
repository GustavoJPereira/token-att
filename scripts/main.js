import { MODULE_ID } from "./constants.js";
import { registerSheetButton } from "./image-config.js";
import { log, registerDebugSetting } from "./logger.js";
import { refreshToken, refreshActorTokens } from "./token-image.js";

Hooks.once("init", () => {
  registerDebugSetting();
  log.info("init", MODULE_ID);
  registerSheetButton();
});

/* ---------- Trigger: HP ---------- */
// Tokens vinculados: o HP muda no Actor.
Hooks.on("updateActor", (actor, changed) => {
  log.debug("hook updateActor", actor.name, changed);
  if (!game.user.isActiveGM) return;
  if (!foundry.utils.hasProperty(changed, "system.attributes.hp")) return;
  refreshActorTokens(actor);
});

// Tokens não vinculados: o HP muda no delta do token.
Hooks.on("updateToken", (tokenDoc, changed) => {
  log.debug("hook updateToken", tokenDoc.name, changed);
  if (!game.user.isActiveGM) return;
  if (!foundry.utils.hasProperty(changed, "delta.system.attributes.hp")) return;
  refreshToken(tokenDoc);
});
