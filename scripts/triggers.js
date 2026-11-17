import { STATUS_IDS } from "./resolver.js";
import { log } from "./logger.js";
import { refreshToken, refreshActorTokens, refreshSoon } from "./token-image.js";

const TRACKED_STATUSES = new Set(Object.values(STATUS_IDS));

async function refreshCombatTokens(combat) {
  for (const combatant of combat.combatants) {
    if (combatant.token) await refreshToken(combatant.token);
  }
}

export function registerTriggers() {
  /* ---------- HP ---------- */
  // Tokens vinculados: o HP muda no Actor.
  Hooks.on("updateActor", (actor, changed) => {
    log.debug("hook updateActor", actor.name, changed);
    if (!game.user.isActiveGM) return;
    if (!foundry.utils.hasProperty(changed, "system.attributes.hp")) return;
    refreshSoon(() => refreshActorTokens(actor));
  });

  // Tokens não vinculados: o HP muda no delta do token.
  Hooks.on("updateToken", (tokenDoc, changed) => {
    log.debug("hook updateToken", tokenDoc.name, changed);
    if (!game.user.isActiveGM) return;
    if (!foundry.utils.hasProperty(changed, "delta.system.attributes.hp")) return;
    refreshSoon(() => refreshToken(tokenDoc));
  });

  /* ---------- Status: charmed, frightened, invisible, disguised, unconscious ---------- */
  const onEffectChange = effect => {
    if (!game.user.isActiveGM) return;
    const actor = effect.parent;
    if (!(actor instanceof foundry.documents.Actor)) return;
    if (!effect.statuses?.some(id => TRACKED_STATUSES.has(id))) return;
    log.debug("trigger de status:", actor.name, [...effect.statuses]);
    refreshSoon(() => refreshActorTokens(actor));
  };
  Hooks.on("createActiveEffect", onEffectChange);
  Hooks.on("deleteActiveEffect", onEffectChange);
  Hooks.on("updateActiveEffect", onEffectChange); // ex.: efeito desativado/ativado

  /* ---------- Combate ---------- */
  // Início do combate (round 0 -> 1) e mudanças de round.
  Hooks.on("updateCombat", (combat, changed) => {
    if (!game.user.isActiveGM || !("round" in changed)) return;
    log.debug("trigger de combate: updateCombat", changed);
    refreshSoon(() => refreshCombatTokens(combat));
  });

  // Fim do combate: os tokens voltam ao normal (HP 100% -> tranquilo / arte original).
  Hooks.on("deleteCombat", combat => {
    if (!game.user.isActiveGM) return;
    log.debug("trigger de combate: deleteCombat");
    refreshSoon(() => refreshCombatTokens(combat));
  });

  // Entrada/saída de um combatente em um combate em andamento.
  const onCombatantChange = combatant => {
    if (!game.user.isActiveGM || !combatant.token) return;
    log.debug("trigger de combate: combatente", combatant.name);
    refreshSoon(() => refreshToken(combatant.token));
  };
  Hooks.on("createCombatant", onCombatantChange);
  Hooks.on("deleteCombatant", onCombatantChange);
}
