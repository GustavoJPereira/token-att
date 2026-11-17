# Token por HP — contexto do projeto

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

**Prioridade (menor para maior):** invisível < disfarçado < normal < combate < HP (75 < 50 < 25) < assustado, encantado < inconsciente.
Vence o evento ativo de maior prioridade que tenha imagem; sem imagem, cai para o próximo.

## Estado da implementação

Feito:
- Manifesto `module.json`, estrutura de pastas.
- Tela de imagens: botão "Imagens do Token" no cabeçalho da ficha do ator (hook `getHeaderControlsApplicationV2`), que abre um `ApplicationV2` com um `<file-picker>` por evento. Salva em `flags.token-por-hp.images.<chave>`. Ainda não testada no Foundry.

Pendente:
- Lógica que troca `texture.src` do token conforme os eventos ativos e a prioridade, só se a imagem existir.
- `scripts/main.js` ainda tem a lógica do conceito antigo (flags `healthy`/`wounded`, limiar único). Deve ser substituída.
- Detecção dos status (condições/efeitos), que depende do sistema de jogo.

## Arquivos

- `module.json`: manifesto.
- `scripts/main.js`: ponto de entrada (init, configuração, hooks; lógica antiga a reescrever).
- `scripts/events.js`: `MODULE_ID`, lista de grupos/eventos, `getImages(actor)`.
- `scripts/image-config.js`: janela `TokenImageConfig` e `registerSheetButton()`.
- `templates/image-config.hbs`: formulário da janela.
- `lang/pt-BR.json`: textos (chaves `TOKEN-POR-HP.*`).
- `CONCEITO.md`: conceito v2 e tasklist.
- `token-por-hp.md`: guia do conceito antigo (desatualizado, mantido como referência de API).

## Convenções

- Alterações de token só no GM ativo (`game.user.isActiveGM`), para não duplicar updates.
- Tokens vinculados mudam HP no Actor (`updateActor`); não vinculados, no `delta` do token (`updateToken`).
- Evitar updates redundantes: comparar com `texture.src` atual antes de atualizar.
- Textos de interface sempre por chaves de tradução, nunca fixos no código.

## Pontos em aberto

- "Normal" e "tranquilo" tratados como o mesmo estado.
- Caminho do HP por sistema (`system.attributes.hp` no dnd5e/pf2e, a confirmar).
- Se `updateActor` dispara para atores sintéticos na v14.
