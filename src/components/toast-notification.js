class ToastNotification extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this._timer = null;
    this._onSavedUpdate = this._onSavedUpdate.bind(this);
  }

  connectedCallback() {
    this.render();
    document.addEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  disconnectedCallback() {
    document.removeEventListener("saved-recipes-updated", this._onSavedUpdate);
    if (this._timer) {
      clearTimeout(this._timer);
    }
  }

  _onSavedUpdate(event) {
    if (!event.detail) return;
    const { recipe, isSaved } = event.detail;
    const rawTitle = recipe && recipe.strMeal ? recipe.strMeal : "Recipe";
    const truncatedTitle =
      rawTitle.length > 32 ? `${rawTitle.slice(0, 32)}...` : rawTitle;

    if (isSaved) {
      this.show(`Added "${truncatedTitle}" to Saved Recipes`, "success");
    } else {
      this.show(`Removed "${truncatedTitle}" from Saved Recipes`, "info");
    }
  }

  show(message, type = "success") {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    const container = this.shadowDOM.querySelector(".toast-container");
    const msgEl = this.shadowDOM.querySelector(".toast-message");
    const iconContainer = this.shadowDOM.querySelector(".toast-icon");

    if (!container || !msgEl || !iconContainer) return;

    msgEl.textContent = message;

    // Set icon based on type
    if (type === "success") {
      iconContainer.className = "toast-icon success";
      iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      iconContainer.className = "toast-icon info";
      iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }

    container.classList.remove("closing");
    container.classList.add("visible");

    // Auto-dismiss after 3 seconds
    this._timer = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    const container = this.shadowDOM.querySelector(".toast-container");
    if (!container || !container.classList.contains("visible")) return;

    container.classList.add("closing");
    setTimeout(() => {
      container.classList.remove("visible", "closing");
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    }, 200);
  }

  render() {
    this.shadowDOM.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :host {
          position: fixed;
          top: 76px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1100;
          pointer-events: none;
          width: auto;
          max-width: calc(100vw - 32px);
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .toast-container {
          display: none;
          pointer-events: auto;
          align-items: center;
          gap: 12px;
          background-color: #262220;
          color: #FFFFFF;
          padding: 12px 18px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.12);
          min-width: 280px;
          max-width: 440px;
          animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .toast-container.visible {
          display: flex;
        }

        .toast-container.closing {
          animation: fadeOut 0.2s ease-in forwards;
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }

        .toast-icon.success {
          background-color: rgba(76, 175, 80, 0.2);
          color: #81C784;
        }

        .toast-icon.info {
          background-color: rgba(125, 41, 65, 0.3);
          color: #F5C6CE;
        }

        .toast-message {
          flex: 1;
          font-size: 0.92rem;
          font-weight: 600;
          line-height: 1.4;
          color: #FFFFFF;
          word-break: break-word;
        }

        .toast-close {
          background: transparent;
          border: 0;
          color: #BDB7B0;
          cursor: pointer;
          font-size: 1.1rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease;
          flex-shrink: 0;
        }

        .toast-close:hover {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.1);
        }

        .toast-close:focus-visible {
          outline: 2px solid #FFFFFF;
          outline-offset: 1px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-8px);
          }
        }

        @media screen and (max-width: 480px) {
          :host {
            top: 68px;
            width: calc(100% - 32px);
          }

          .toast-container {
            width: 100%;
            min-width: 0;
            padding: 10px 14px;
            gap: 10px;
          }

          .toast-message {
            font-size: 0.88rem;
          }
        }
      </style>

      <div class="toast-container" role="status" aria-live="polite">
        <div class="toast-icon" aria-hidden="true"></div>
        <p class="toast-message"></p>
        <button class="toast-close" type="button" aria-label="Dismiss notification">✕</button>
      </div>
    `;

    const closeBtn = this.shadowDOM.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.hide());
    }
  }
}

customElements.define("toast-notification", ToastNotification);
export default ToastNotification;
