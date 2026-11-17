import { MODULE_ID, EVENT_GROUPS, getImages } from "./events.js";
import { log } from "./logger.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Janela para escolher a imagem do token de cada evento. */
export class TokenImageConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    log.debug("TokenImageConfig criado para", actor.name, actor.id);
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["token-att"],
    position: { width: 560, height: "auto" },
    window: { icon: "fa-solid fa-masks-theater", contentClasses: ["standard-form"] },
    form: {
      handler: TokenImageConfig.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: true
    }
  };

  static PARTS = {
    form: { template: `modules/${MODULE_ID}/templates/image-config.hbs` },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  // Uma janela por ator.
  get id() {
    return `${MODULE_ID}-config-${this.actor.id}`;
  }

  get title() {
    return game.i18n.format("TOKEN-ATT.Config.Title", { name: this.actor.name });
  }

  async _prepareContext(options) {
    log.debug("_prepareContext", this.actor.name);
    const context = await super._prepareContext(options);
    const images = getImages(this.actor);
    context.groups = EVENT_GROUPS.map(group => ({
      label: game.i18n.localize(`TOKEN-ATT.Group.${group.id}`),
      events: group.events.map(key => ({
        key,
        label: game.i18n.localize(`TOKEN-ATT.Event.${key}`),
        value: images[key] ?? ""
      }))
    }));
    context.buttons = [
      { type: "submit", icon: "fa-solid fa-floppy-disk", label: "TOKEN-ATT.Config.Save" }
    ];
    return context;
  }

  static async #onSubmit(event, form, formData) {
    const { images } = foundry.utils.expandObject(formData.object);
    log.info("Salvando imagens de", this.actor.name, images);
    try {
      await this.actor.setFlag(MODULE_ID, "images", images ?? {});
      log.debug("Imagens salvas");
    } catch (err) {
      log.error("Falha ao salvar imagens", err);
      throw err;
    }
  }
}

/** Adiciona o botão "Imagens do Token" no cabeçalho da ficha de ator. */
export function registerSheetButton() {
  log.debug("registerSheetButton: hook registrado");
  Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
    const actor = app.document;
    if (!(actor instanceof foundry.documents.Actor) || !actor.isOwner) return;
    log.debug("Adicionando botão na ficha de", actor.name);
    controls.push({
      icon: "fa-solid fa-masks-theater",
      label: "TOKEN-ATT.Config.Button",
      action: "tokenPorHpImages",
      onClick: () => {
        log.debug("Botão clicado, abrindo janela para", actor.name);
        new TokenImageConfig(actor).render({ force: true });
      }
    });
  });
}
