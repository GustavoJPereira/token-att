# Token Att — contexto do projeto

Módulo do Foundry VTT (alvo: v14, verificado em 14.369). Idioma do projeto e da interface: português (pt-BR).

## Ideia atual

O módulo **armazena imagens de tokens por personagem** e deixa **eventos específicos trocarem a arte do token**. A troca só acontece se a imagem do evento existir.

| Grupo | Chave | Evento |
|---|---|---|
| Combate | `calm` | fora de combate / normal (tranquilo) |
| Combate | `alert` | dentro de combate |
| HP | `hp75` | abaixo de 75% (arranhado) |
| HP | `hp50` | abaixo de 50% (meio ferido) |
| HP | `hp25` | abaixo de 25% (muito ferido) |
| HP | `unconscious` | inconsciente, HP em 0% |
| Status | `disguised` | disfarçado (óculos com bigode) |
| Status | `frightened` | assustado |
| Status | `charmed` | encantado |
| Status | `invisible` | invisível (destaque, como um recorte) |

**Prioridade (menor para maior):** invisível < normal < combate < HP (75 < 50 < 25) < assustado < disfarçado < encantado < inconsciente.
Vence o evento ativo de maior prioridade que tenha imagem; sem imagem, cai para o próximo.

## Estado da implementação

Feito:
- Manifesto `module.json`, estrutura de pastas.
- Tela de imagens: botão "Imagens do Token" no cabeçalho da ficha do ator (hook `getHeaderControlsApplicationV2`), que abre um `ApplicationV2` com um `<file-picker>` por evento, salvando automaticamente a cada mudança (sem botão Salvar). Salva em `flags.token-att.images.<chave>`. Ainda não testada no Foundry.

- Decisão de imagem por token (`resolver.js`) e aplicação (`token-image.js`), com triggers em `triggers.js`: HP, status (charmed e stunned, frightened, invisible, disguised, unconscious) e combate (início, fim, entrada/saída de combatente). Sem ator/token/imagem, nada é feito.

Pendente:
- Confirmar os ids de status por sistema (`STATUS_IDS` em `resolver.js`; "disfarçado" é registrado pelo módulo em `statuses.js`).

## Arquivos

- `module.json`: manifesto.
- `scripts/main.js`: ponto de entrada (init).
- `scripts/statuses.js`: registra o status customizado `disguised` em `CONFIG.statusEffects`.
- `scripts/triggers.js`: hooks que disparam a atualização (HP, status, combate).
- `scripts/resolver.js`: decide a imagem (eventos ativos + `PRIORITY`). Não altera nada.
- `scripts/token-image.js`: aplica a imagem no token (`refreshToken`, `refreshActorTokens`, `refreshSoon`); guarda a arte original em `flags.token-att.originalSrc` e a restaura quando nenhum evento tem imagem.
- `scripts/events.js`: `MODULE_ID`, lista de grupos/eventos, `getImages(actor)`.
- `scripts/image-config.js`: janela `TokenImageConfig` e `registerSheetButton()`.
- `templates/image-config.hbs`: formulário da janela.
- `styles/token-att.css`: faz o formulário rolar em janelas pequenas.
- `lang/en.json` e `lang/pt-BR.json`: textos (chaves `TOKEN-ATT.*`).
- `CONCEITO.md`: conceito v2 e tasklist.
- `token-att.md`: guia do conceito antigo (desatualizado, mantido como referência de API).

## Convenções

- Alterações de token só no GM ativo (`game.user.isActiveGM`), para não duplicar updates.
- Tokens vinculados mudam HP no Actor (`updateActor`); não vinculados, no `delta` do token (`updateToken`).
- Evitar updates redundantes: comparar com `texture.src` atual antes de atualizar.
- Textos de interface sempre por chaves de tradução, nunca fixos no código.

## Pontos em aberto

- "Normal" e "tranquilo" tratados como o mesmo estado.
- Caminho do HP por sistema (`system.attributes.hp` no dnd5e/pf2e, a confirmar).
- Se `updateActor` dispara para atores sintéticos na v14.
