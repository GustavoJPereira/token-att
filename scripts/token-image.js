import { resolveImage } from "./resolver.js";
import { log } from "./logger.js";

/** Aplica no token a imagem decidida, se houver e se for diferente da atual. */
export async function refreshToken(tokenDoc) {
  if (!tokenDoc?.actor) {
    log.debug("refreshToken: token sem ator, ignorado", tokenDoc?.name);
    return;
  }
  const result = resolveImage(tokenDoc);
  if (!result) return;
  if (tokenDoc.texture.src === result.src) {
    log.debug("Arte já correta, nada a fazer:", tokenDoc.name);
    return;
  }
  log.info("Trocando arte de", tokenDoc.name, "para", result.src, `(${result.event})`);
  try {
    await tokenDoc.update({ "texture.src": result.src });
  } catch (err) {
    log.error("Falha ao atualizar token", tokenDoc.name, err);
  }
}

/** Atualiza todos os tokens do ator, em qualquer cena. Sem tokens, não faz nada. */
export async function refreshActorTokens(actor) {
  const tokens = actor.getDependentTokens();
  if (!tokens.length) {
    log.debug("refreshActorTokens:", actor.name, "não tem tokens em nenhuma cena");
    return;
  }
  for (const tokenDoc of tokens) await refreshToken(tokenDoc);
}
