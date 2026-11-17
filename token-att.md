> **Atenção:** o conceito mudou. Veja `CONCEITO.md` (v2). Este guia descreve o conceito antigo (duas artes por limiar de HP).

# Módulo Foundry VTT: trocar a arte do token conforme o HP

Guia para criar um módulo que alterna a imagem do token entre duas artes (ex.: "saudável" e "ferido") dependendo do HP do personagem.

## 1. Versão e documentação consultadas

| Item | Informação |
|---|---|
| Versão estável mais recente encontrada | **Foundry VTT 14.369** (Version 14 – Stable 11), lançada em 08/10/2026. O rodapé da documentação da API já indica 14.370. |
| Documentação da API (v14) | https://foundryvtt.com/api/v14/ |
| Hook genérico de update | https://foundryvtt.com/api/v14/functions/hookEvents.updateDocument.html |
| `TokenDocument` | https://foundryvtt.com/api/v14/classes/foundry.documents.TokenDocument.html |
| Notas da versão 14.369 | https://foundryvtt.com/releases/14.369 |
| Artigo de desenvolvimento de módulos | https://foundryvtt.com/article/module-development/ |
| Wiki da comunidade | https://foundryvtt.wiki/en/development/api/document |

Observações:
- A v14.369 não traz breaking changes sinalizados para módulos. Ela corrige, entre outros, "Token bars não atualizavam quando alteradas via código" (#14730).
- O artigo oficial de desenvolvimento de módulos pode estar defasado (menciona v10/v11). Confirme campos do manifesto na documentação da versão que você usar.
- Foundry **não atualiza para a v14 in-place**: é preciso reinstalar. Confirme que o seu mundo e o seu sistema (dnd5e, pf2e, etc.) já suportam a v14 antes de testar.

## 2. Ideia geral

1. Escutar mudanças de HP via o hook `updateActor` (e `updateToken` para tokens não vinculados).
2. Ler o HP atual e o máximo do ator.
3. Comparar com um limiar (ex.: 50 %).
4. Atualizar `texture.src` do(s) token(s) do ator para a arte correspondente.

### Conceitos da API usados

- **Hook `updateActor(document, changed, options, userId)`**: dispara em todos os clientes depois que o update foi processado. `changed` é só o diferencial.
- **`Actor#getActiveTokens()`**: tokens do ator na cena ativa (objetos `Token`; use `.document` para obter o `TokenDocument`). Existe também `Actor#getDependentTokens()`, que retorna `TokenDocument`s em cenas.
- **`TokenDocument#update(data)`**: grava no banco. A imagem fica em `texture.src`.
- **`TokenDocument#actorLink`**: se `true`, o token usa o ator principal. Se `false`, é uma cópia sintética (`ActorDelta`), e as mudanças de HP ficam no `delta` do token.
- **Execute só no GM** (`game.user.isActiveGM`), senão cada cliente tentaria atualizar o token ao mesmo tempo.

> Não confirmei na documentação se `updateActor` dispara para atores sintéticos (tokens não vinculados). Por isso o código abaixo também escuta `updateToken`. Teste os dois casos.

## 3. Estrutura de arquivos

```
token-att/
├── module.json
├── scripts/
│   └── main.js
├── lang/
│   └── pt-BR.json
└── (opcional) artes em assets/
```

A pasta deve ter o mesmo nome do `id` do módulo e ficar em `Data/modules/`.

## 4. `module.json`

Obrigatórios segundo o artigo oficial: `id`, `title`, `description`, `version`. O `id` é minúsculo, com hífens, e igual ao nome da pasta. `compatibility`, `esmodules`, `languages` e `relationships` são opcionais, mas recomendados.

```json
{
  "id": "token-att",
  "title": "Token Att",
  "description": "Troca a arte do token entre duas imagens conforme o HP do personagem.",
  "version": "1.0.0",
  "compatibility": { "minimum": "14", "verified": "14.369" },
  "authors": [{ "name": "Seu Nome" }],
  "esmodules": ["scripts/main.js"],
  "languages": [{ "lang": "pt-BR", "name": "Português (Brasil)", "path": "lang/pt-BR.json" }]
}
```

Se quiser restringir a um sistema, adicione `"relationships": { "systems": [{ "id": "dnd5e", "type": "system" }] }`.

## 5. `scripts/main.js`

```js
const MODULE_ID = "token-att";

/* ---------- Configurações ---------- */
Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "threshold", {
    name: "Limiar de HP (%)",
    hint: "Abaixo ou igual a este percentual, usa a arte 'ferido'.",
    scope: "world",
    config: true,
    type: Number,
    default: 50,
    range: { min: 1, max: 99, step: 1 }
  });
});

/* ---------- Caminho do HP (ajuste por sistema) ---------- */
// dnd5e: system.attributes.hp.{value,max}
// pf2e:  system.attributes.hp.{value,max}
// Outros sistemas: altere aqui.
function getHP(actor) {
  const hp = actor.system?.attributes?.hp;
  if (!hp || !Number.isFinite(hp.max) || hp.max <= 0) return null;
  return { value: hp.value, max: hp.max };
}

/* ---------- Artes: guardadas em flags do ator ---------- */
// actor.flags["token-att"].healthy / .wounded
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
// Tokens vinculados (actorLink = true): o HP muda no Actor.
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
```

### Como definir as duas artes por personagem

Opção simples para começar: pelo console (F12) com o ator selecionado:

```js
const a = game.actors.getName("Nome do Personagem");
await a.setFlag("token-att", "healthy", "tokens/heroi-saudavel.webp");
await a.setFlag("token-att", "wounded", "tokens/heroi-ferido.webp");
```

Opção melhor (próximo passo): adicionar campos na ficha do ator com o hook `renderActorSheet` (ou o equivalente da sua ficha/ApplicationV2) com um `FilePicker` para cada arte.

## 6. Melhorias possíveis

- **UI na ficha** para escolher as duas artes (FilePicker) e o limiar por personagem.
- **Mais de dois estágios** (saudável / ferido / crítico): troque a condição por uma lista de faixas ordenadas.
- **Tratar HP temporário** e HP máximo modificado por efeitos.
- **Tratar morte/0 HP** com uma terceira arte.
- **Aplicar ao criar o token** (hook `createToken`) e ao carregar a cena, chamando `refreshToken`.
- **Evitar loops/requisições redundantes:** já feito com a comparação `texture.src !== wanted`.
- **Anel dinâmico de token (`ring`)**: o `TokenDocument` tem o campo `ring` e a noção de `hasDistinctSubjectTexture`; se usar anel, teste se a troca de `texture.src` se comporta como esperado.

## 7. Instalação e testes

1. Coloque a pasta `token-att/` em `Data/modules/` (no Linux costuma ser `~/.local/share/FoundryVTT/Data/modules/`).
2. Reinicie o Foundry, abra o mundo e ative o módulo em *Configurações → Gerenciar Módulos*.
3. Defina as flags de artes de um ator e coloque seu token na cena.
4. Altere o HP (ficha ou barra do token) e veja a arte trocar.
5. Teste: token vinculado, token não vinculado (arrastado de um ator não vinculado), jogador alterando o HP e GM conectado (o código só roda no GM ativo).
6. Pressione F12 para ver erros no console.

## 8. Pontos não verificados

- Caminho exato do HP em cada sistema na v14 (`system.attributes.hp` é o padrão do dnd5e/pf2e até onde sei, mas confirme no seu sistema).
- Se `updateActor` dispara para atores sintéticos na v14 (por isso há o hook extra `updateToken`).
- Sintaxe detalhada de `TextureData` na v14: `texture.src` é o caminho tradicional.

Confirme esses três pontos nas páginas `Actor`, `ActorDelta` e `TextureData` da API v14 antes de publicar o módulo.

## Fontes

- [Release 14.369](https://foundryvtt.com/releases/14.369)
- [API v14 – updateDocument](https://foundryvtt.com/api/v14/functions/hookEvents.updateDocument.html)
- [API v14 – TokenDocument](https://foundryvtt.com/api/v14/classes/foundry.documents.TokenDocument.html)
- [Module Development](https://foundryvtt.com/article/module-development/)
- [Foundry VTT Wiki – Document](https://foundryvtt.wiki/en/development/api/document)
