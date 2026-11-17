import { MODULE_ID } from "./constants.js";
import { registerSheetButton } from "./image-config.js";
import { log, registerDebugSetting } from "./logger.js";
import { registerTriggers } from "./triggers.js";

Hooks.once("init", () => {
  registerDebugSetting();
  log.info("init", MODULE_ID);
  registerSheetButton();
  registerTriggers();
});
