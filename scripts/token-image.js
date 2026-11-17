import { MODULE_ID } from "./constants.js";
import { resolveImage } from "./resolver.js";
import { log } from "./logger.js";

/**
 * Aplica no token a imagem decidida.
 * - Guarda a arte original do token (flag `originalSrc`) na primeira troca.
 * - Se nenhum evento tiver imagem, devolve a arte original.
 */
export async function refreshToken(tokenDoc) {
  if (!tokenDoc?.actor) {
    log.debug("refreshToken: token sem ator, ignorado", tokenDoc?.name);
    return;
  }
  const current = tokenDoc.texture.src;
  const original = tokenDoc.getFlag(MODULE_ID, "originalSrc");
  const result = resolveImage(tokenDoc);

  try {
    if (!result) {
      if (original && original !== current) {
        log.info("Restaurando arte original de", tokenDoc.name, "->", original);
        await tokenDoc.update({
          "texture.src": original,
          [`flags.${MODULE_ID}.-=originalSrc`]: null
        });
      } else if (original) {
        await tokenDoc.unsetFlag(MODULE_ID, "originalSrc");
      }
      return;
    }

    if (current === result.src) {
      log.debug("Arte já correta, nada a fazer:", tokenDoc.name);
      return;
    }
    log.info("Trocando arte de", tokenDoc.name, "para", result.src, `(${result.event})`);
    const update = { "texture.src": result.src };
    if (!original) update[`flags.${MODULE_ID}.originalSrc`] = current;
    await tokenDoc.update(update);
  } catch (err) {
    log.error("Falha ao atualizar token", tokenDoc.name, err);
  }
}

/** Atualiza todos os tokens do ator, em qualquer cena. Sem tokens, não faz nada. */
export async function refreshActorTokens(actor) {
  // Ator sintético (token não vinculado) pertence a um único token.
  const tokens = actor.isToken ? [actor.token].filter(Boolean) : actor.getDependentTokens();
  if (!tokens.length) {
    log.debug("refreshActorTokens:", actor.name, "não tem tokens em nenhuma cena");
    return;
  }
  for (const tokenDoc of tokens) await refreshToken(tokenDoc);
}

/**
 * Atualiza depois que o Foundry terminou de processar a mudança (ator
 * recalculado, combate removido da coleção etc.). Evita ler estado velho.
 */
export function refreshSoon(fn) {
  setTimeout(() => fn().catch(err => log.error("refreshSoon falhou", err)), 0);
}
