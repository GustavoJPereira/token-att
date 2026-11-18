# Token Att

A module for [Foundry VTT](https://foundryvtt.com/) (v14) that **automatically swaps a token's art** based on what happens to the character: combat, HP and status.

For each character you pick one image per event. The module decides which one to use and only swaps if that image exists. If no event has an image, the token goes back to its original art.

> **AI disclosure:** part of this module's code was written with the help of AI (Claude by Anthropic, via Claude Code). The concept, rules and design decisions are the author's; the generated code was reviewed and tested by the author in Foundry. It may still contain bugs. If you find one, please open an issue.

## How it works

1. On the character sheet, click **Token Images** (in the header menu).
2. Choose an image for each event using Foundry's standard file picker (any image already uploaded to Foundry works). Everything is saved automatically.
3. The module swaps the art of the character's tokens when the events happen.

### Events

| Group | Event | When |
|---|---|---|
| Combat | Calm | out of combat / normal |
| Combat | Alert | token is in a started combat |
| HP | Scratched | HP below 75% |
| HP | Half wounded | HP below 50% |
| HP | Badly wounded | HP below 25% |
| HP | Unconscious | HP at 0 |
| Status | Disguised | `disguised` status |
| Status | Frightened | `frightened` status |
| Status | Charmed | `charmed` or `stunned` status |
| Status | Invisible | `invisible` status |

The `disguised` status doesn't exist in Foundry; the module registers it, and it shows up in the token's condition list as "Disguised".

### Priority

When more than one event is active, the highest-priority one **that has an image** wins:

unconscious > charmed > disguised > frightened > HP (25% > 50% > 75%) > alert > calm > invisible

The order lives in `PRIORITY`, in `scripts/resolver.js`, and is easy to change.

## What triggers a swap

- HP changes (linked and unlinked tokens).
- Creating, removing or changing effects with the statuses above.
- Combat start and end, round changes, and combatants joining or leaving.

Only the active GM changes tokens. Tokens without an actor, and actors without tokens, are ignored.

## Installation

For now, manually: clone or copy this folder to `Data/modules/token-att` (on Linux, `~/.local/share/FoundryVTT/Data/modules/`), restart Foundry and enable the module in your world.

```bash
cd ~/.local/share/FoundryVTT/Data/modules
git clone https://github.com/GustavoJPereira/token-att.git
```

## Compatibility

- Foundry VTT v14 (verified on 14.369).
- HP is read from `system.attributes.hp`, as in dnd5e. Other systems may need changes to `getHP` (`scripts/resolver.js`).
- Status ids (`charmed`, `frightened`, etc.) follow dnd5e. Adjust `STATUS_IDS` in `scripts/resolver.js` if your system uses different ones.

## Structure

```
token-att/
├── module.json              manifest
├── scripts/
│   ├── main.js              entry point
│   ├── triggers.js          hooks that trigger updates
│   ├── resolver.js          decides the image (active events + priority)
│   ├── token-image.js       applies the image to the token
│   ├── image-config.js      image selection window
│   ├── statuses.js          registers the "disguised" status
│   ├── events.js            event list and image lookup
│   ├── logger.js            console logging
│   └── constants.js
├── templates/image-config.hbs
├── styles/token-att.css
└── lang/                    en.json, pt-BR.json
```

Images are stored in actor flags: `flags.token-att.images.<event>`.

## Debugging

In *Settings → Module Settings*, turn on **Debug logs** and open the browser console (F12). Messages start with `token-att |`.

## Future ideas

- Apply the image when a token is dropped on the scene (`createToken`).
- Support for other game systems.

## License

[The Unlicense](LICENSE): public domain. You may copy, modify, publish, use and sell this module for any purpose, without asking permission and without giving credit.
