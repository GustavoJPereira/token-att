# Token por HP — conceito (v2)

Módulo que **armazena imagens de tokens por personagem** e permite que **eventos específicos** troquem a arte do token automaticamente. A troca só acontece se a imagem do estado existir.

## Eventos e imagens

| Grupo | Evento | Imagem |
|---|---|---|
| Combate | Fora de combate / normal | tranquilo |
| Combate | Dentro de combate | alerta |
| HP | abaixo de 75% | arranhado |
| HP | abaixo de 50% | meio ferido |
| HP | abaixo de 25% | muito ferido |
| HP | inconsciente (HP em 0%) | inconsciente |
| Status | Disfarçado | óculos com bigode |
| Status | Assustado | assustado |
| Status | Encantado | encantado |
| Status | Invisível | destaque, como se fosse um recorte |

## Prioridade (da menor para a maior)

invisível < disfarçado < normal < dentro de combate < HP (do maior para o menor: 75% < 50% < 25%) < assustado, encantado < inconsciente

Vence o evento ativo de maior prioridade **que tenha imagem definida**; se não houver imagem, cai para o próximo da lista.

## Interface

Na ficha do personagem aparece um **botão extra** que abre uma janela com um campo de imagem (FilePicker) para cada evento da tabela acima.

## Tasklist

- [ ] Montar a tela para inserir as imagens dos tokens
- [ ] Montar o código que muda as imagens somente se existirem
- [ ] Reescrever `scripts/main.js` (hoje implementa o conceito antigo: duas artes + limiar único)
- [ ] Atualizar `lang/pt-BR.json` com os textos da nova tela

## Pontos em aberto

- "Normal" e "tranquilo" foram tratados como o mesmo estado (padrão fora de combate).
- Como detectar cada status (condições/efeitos do sistema) depende do sistema de jogo.
- Onde guardar as imagens: sugestão de flags do ator (`flags.token-por-hp.images.<evento>`).
