# Token Att

Módulo para o [Foundry VTT](https://foundryvtt.com/) (v14) que **troca automaticamente a arte do token** conforme o que acontece com o personagem: combate, HP e status.

Você escolhe, para cada personagem, uma imagem por evento. O módulo decide qual usar e só troca se a imagem existir. Se nenhum evento tiver imagem, o token volta para a arte original.

> **Aviso sobre o uso de IA:** parte do código deste módulo foi escrita com a ajuda de IA (Claude, da Anthropic, via Claude Code). O conceito, as regras e as decisões de design são do autor; o código gerado foi revisado e testado pelo autor no Foundry. Mesmo assim, pode conter erros. Se encontrar algum, abra uma issue.

## Como funciona

1. Na ficha do personagem, clique em **Imagens do Token** (no menu do cabeçalho).
2. Escolha uma imagem para cada evento, usando o seletor de arquivos padrão do Foundry (qualquer imagem já enviada ao Foundry serve). Tudo é salvo automaticamente.
3. O módulo troca a arte dos tokens do personagem quando os eventos acontecem.

### Eventos

| Grupo | Evento | Quando |
|---|---|---|
| Combate | Tranquilo | fora de combate / normal |
| Combate | Alerta | token em um combate iniciado |
| HP | Arranhado | HP abaixo de 75% |
| HP | Meio ferido | HP abaixo de 50% |
| HP | Muito ferido | HP abaixo de 25% |
| HP | Inconsciente | HP em 0 |
| Status | Disfarçado | status `disguised` |
| Status | Assustado | status `frightened` |
| Status | Encantado | status `charmed` ou `stunned` |
| Status | Invisível | status `invisible` |

O status `disguised` não existe no Foundry; o módulo o registra e ele aparece na lista de condições do token com o nome "Disguised".

### Prioridade

Quando mais de um evento está ativo, vence o de maior prioridade **que tenha imagem**:

inconsciente > encantado > disfarçado > assustado > HP (25% > 50% > 75%) > alerta > tranquilo > invisível

A ordem fica em `PRIORITY`, em `scripts/resolver.js`, e é fácil de alterar.

## O que dispara a troca

- Mudança de HP (tokens vinculados e não vinculados).
- Criação, remoção ou alteração de efeitos com os status acima.
- Início e fim do combate, mudança de round e entrada/saída de combatentes.

Só o GM ativo altera tokens. Tokens sem ator, e atores sem tokens, são ignorados.

## Instalação

Por enquanto, manualmente: clone ou copie esta pasta para `Data/modules/token-att` (no Linux, `~/.local/share/FoundryVTT/Data/modules/`), reinicie o Foundry e ative o módulo no seu mundo.

```bash
cd ~/.local/share/FoundryVTT/Data/modules
git clone https://github.com/GustavoJPereira/token-att.git
```

## Compatibilidade

- Foundry VTT v14 (verificado na 14.369).
- O HP é lido de `system.attributes.hp`, como no dnd5e. Outros sistemas podem precisar de ajuste em `getHP` (`scripts/resolver.js`).
- Os ids de status (`charmed`, `frightened`, etc.) seguem o dnd5e. Ajuste `STATUS_IDS` em `scripts/resolver.js` se o seu sistema usar outros.

## Estrutura

```
token-att/
├── module.json              manifesto
├── scripts/
│   ├── main.js              ponto de entrada
│   ├── triggers.js          hooks que disparam a atualização
│   ├── resolver.js          decide a imagem (eventos ativos + prioridade)
│   ├── token-image.js       aplica a imagem no token
│   ├── image-config.js      janela de escolha das imagens
│   ├── statuses.js          registra o status "disguised"
│   ├── events.js            lista de eventos e leitura das imagens
│   ├── logger.js            logs no console
│   └── constants.js
├── templates/image-config.hbs
├── styles/token-att.css
└── lang/                    en.json, pt-BR.json
```

As imagens ficam nas flags do ator: `flags.token-att.images.<evento>`.

## Depuração

Em *Configurações → Módulos*, ligue **Debug logs** e abra o console do navegador (F12). As mensagens começam com `token-att |`.

## Ideias futuras

- Aplicar a imagem ao soltar o token na cena (`createToken`).
- Suporte a outros sistemas de jogo.

## Licença

Ainda não definida.
