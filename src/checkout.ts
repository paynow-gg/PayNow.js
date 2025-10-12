// @ts-expect-error
import zoid from "zoid";

import { BASE_URL, DEFAULT_HEIGHT, DEFAULT_WIDTH } from "./constants";

import createContainerTemplate from "./templates/container";
import createPrerenderTemplate from "./templates/prerender";
import createModal, { type Modal } from "./ui/modal";

type CheckoutEvents = {
  ready: () => void;
  closed: () => void;
  completed: ({ orderId }: { orderId: string }) => void;
};

export default class Checkout {
  private isOpen: boolean;

  private zoid?: any;
  private zoidComponent?: any;

  private modal?: Modal;

  private listeners: { [K in keyof CheckoutEvents]?: CheckoutEvents[K][] };

  private externalPageInterval?: number;

  constructor() {
    this.isOpen = false;
    this.listeners = {};
  }

  // State management

  open({ token, baseURL }: { token: string; baseURL?: string }) {
    if (this.isOpen) {
      throw new Error("A checkout is already open");
    }

    if (window.innerWidth <= DEFAULT_WIDTH) {
      window.location.href = `${baseURL ?? BASE_URL}/?t=${token}`;

      return;
    }

    this.isOpen = true;

    this.ensureZoid();

    this.modal = createModal();

    this.zoidComponent = this.zoid({
      token,
      baseURL,
      externalPageOpen: false,
      onCompleted: ({ orderId }: { orderId: string }) => this.emit("completed", { orderId }),
    });

    this.zoidComponent.updateProps({
      closeGracefully: this.closeGracefully.bind(this),
      openExternalPage: this.openExternalPage.bind(this),
    });

    this.modal.onClose(() => this.closeGracefully());
    this.modal.showBackdrop();

    this.zoidComponent
      .renderTo(window, this.modal.content, "iframe")
      .then(async () => {
        await this.modal?.showContent();

        this.emit("ready");
      });
  }

  close() {
    this.closeGracefully();
  }

  private async closeGracefully() {
    if (this.externalPageInterval) {
      clearInterval(this.externalPageInterval);

      this.externalPageInterval = undefined;
    }

    await this.modal?.hideAll();
    await this.zoidComponent?.close();
    await this.modal?.destroy();

    this.isOpen = false;

    this.emit("closed");

    this.modal = undefined;
    this.zoidComponent = undefined;
  }

  // Zoid handling

  private ensureZoid() {
    if (this.zoid) {
      return;
    }

    this.zoid = zoid.create({
      tag: "paynow-gg-checkout",

      url: ({ props }: { props: { baseURL?: string; token: string } }) =>
        `${props.baseURL ?? BASE_URL}/?t=${props.token}`,

      dimensions: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
      autoResize: { width: false, height: false },

      prerenderTemplate: createPrerenderTemplate,
      containerTemplate: createContainerTemplate,

      attributes: {
        iframe: {
          allow: `payment ${BASE_URL}`,
        },
      },

      props: {
        token: {
          type: "string",
        },
        closeGracefully: {
          type: "function",
          required: false,
        },
        openExternalPage: {
          type: "function",
          required: false,
        },
        externalPageOpen: {
          type: "boolean",
        },
        onCompleted: {
          type: "function",
        },
      },
    });
  }

  // Event handling

  on<K extends keyof CheckoutEvents>(event: K, handler: CheckoutEvents[K]) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(handler);
  }

  off<K extends keyof CheckoutEvents>(event: K, handler: CheckoutEvents[K]) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event]?.filter(
      (h) => h !== handler,
    ) as any;
  }

  private emit<K extends keyof CheckoutEvents>(
    event: K,
    ...args: Parameters<CheckoutEvents[K]>
  ) {
    this.listeners[event]?.forEach((handler) => {
      (handler as any)(...args);
    });
  }

  // External page handling

  private openExternalPage(url: string) {
    const newWindow = window.open(url);

    this.zoidComponent?.updateProps({ externalPageOpen: true });

    this.externalPageInterval = setInterval(() => {
      if (newWindow && !newWindow.closed) {
        return;
      }

      clearInterval(this.externalPageInterval);

      this.externalPageInterval = undefined;

      this.zoidComponent?.updateProps({ externalPageOpen: false });
    }, 1_000);
  }
}
