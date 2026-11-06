import storage from "../services/storage.js";

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

class RecipeDialog extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this._recipe = null;
    this._isOpen = false;
    this._triggerElement = null;
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._onSavedUpdate = this._onSavedUpdate.bind(this);
  }

  connectedCallback() {
    window.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this._handleKeyDown);
    document.removeEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  _handleKeyDown(event) {
    if (event.key === "Escape" && this._isOpen) {
      this.close();
    }
  }

  _onSavedUpdate(e) {
    if (this._isOpen && this._recipe && e.detail && String(e.detail.idMeal) === String(this._recipe.idMeal)) {
      this._updateBookmarkState(e.detail.isSaved);
    }
  }

  _updateBookmarkState(isSaved) {
    const btn = this.shadowDOM.querySelector(".btn-bookmark");
    if (!btn || !this._recipe) return;

    btn.classList.toggle("active", isSaved);
    btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      isSaved
        ? `Remove ${this._recipe.strMeal} from saved recipes`
        : `Save ${this._recipe.strMeal} to favorites`
    );
    btn.setAttribute(
      "title",
      isSaved ? "Remove from saved recipes" : "Save recipe"
    );

    const svg = btn.querySelector("svg");
    if (svg) {
      svg.setAttribute("fill", isSaved ? "#7D2941" : "none");
    }
  }

  show(recipe, triggerElement = null) {
    this._recipe = recipe;
    this._isOpen = true;
    this._triggerElement = triggerElement;
    this.render();
    document.body.style.overflow = "hidden";

    const closeBtn = this.shadowDOM.querySelector(".btn-close");
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  close() {
    this._isOpen = false;
    this._recipe = null;
    this.shadowDOM.innerHTML = "";
    document.body.style.overflow = "";

    if (this._triggerElement && typeof this._triggerElement.focus === "function") {
      this._triggerElement.focus();
    }
  }

  _formatInstructions(text) {
    if (!text) return "";
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    const rawBlocks = normalized.split(/\n\s*\n+/);
    const blocks = [];

    for (let i = 0; i < rawBlocks.length; i++) {
      let block = rawBlocks[i].trim();
      if (!block) continue;

      if (/^(?:step\s*)?\d+[\.:)]?$/i.test(block) && i + 1 < rawBlocks.length) {
        const stepNum = block.replace(/[^0-9]/g, "");
        const prefix = stepNum ? `Step ${stepNum}: ` : "";
        rawBlocks[i + 1] = prefix + rawBlocks[i + 1].trim();
        continue;
      }

      block = block.replace(/^((?:step\s*)?\d+[\.:)]?)\n+/i, (match, p1) => {
        const stepNum = p1.replace(/[^0-9]/g, "");
        return stepNum ? `Step ${stepNum}: ` : "";
      });

      const lines = block
        .split("\n")
        .map((l) => escapeHtml(l.trim()))
        .filter(Boolean);

      if (lines.length > 0) {
        const innerHtml = lines.join("<br />");
        blocks.push(`<p class="instruction-paragraph">${innerHtml}</p>`);
      }
    }

    return blocks.join("");
  }

  render() {
    if (!this._isOpen || !this._recipe) {
      this.shadowDOM.innerHTML = "";
      return;
    }

    const isSaved = storage.isRecipeSaved(this._recipe.idMeal);

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const name = this._recipe[`strIngredient${i}`];
      const measure = this._recipe[`strMeasure${i}`];
      if (name && name.trim()) {
        ingredients.push({
          name: name.trim(),
          measure: measure ? measure.trim() : ""
        });
      }
    }

    const ingredientsHtml = ingredients
      .map((item) => {
        const measureMarkup = item.measure
          ? `<span class="ingredient-measure">${escapeHtml(item.measure)}</span>`
          : "";
        return `
          <li class="ingredient-item">
            ${measureMarkup}
            <span class="ingredient-name">${escapeHtml(item.name)}</span>
          </li>
        `;
      })
      .join("");

    const categoryChip = this._recipe.strCategory
      ? `<span class="chip chip-category">${escapeHtml(this._recipe.strCategory)}</span>`
      : "";

    const areaChip = this._recipe.strArea
      ? `<span class="chip chip-area">${escapeHtml(this._recipe.strArea)}</span>`
      : "";

    const videoButton =
      this._recipe.strYoutube && this._recipe.strYoutube.startsWith("http")
        ? `
          <a
            class="btn-video"
            href="${escapeHtml(this._recipe.strYoutube)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg class="video-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Watch Video Tutorial</span>
          </a>
        `
        : "";

    this.shadowDOM.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(38, 34, 32, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-dialog {
          background-color: #FFFFFF;
          border-radius: 16px;
          max-width: 660px;
          width: 100%;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.25s ease-out;
          position: relative;
        }

        .modal-header {
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 14px 20px;
          border-bottom: 1px solid #E8E2D9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background-color: #FFFFFF;
        }

        .header-title-container {
          flex: 1;
          min-width: 0;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #262220;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-chips {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .chip {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .chip-category {
          background-color: rgba(125, 41, 65, 0.1);
          color: #7D2941;
        }

        .chip-area {
          background-color: #E8E2D9;
          color: #554D46;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-bookmark {
          width: 44px;
          height: 44px;
          border: 0;
          background-color: transparent;
          border-radius: 8px;
          color: #6B635E;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }

        .btn-bookmark:hover {
          background-color: #EDE7DE;
          color: #7D2941;
        }

        .btn-bookmark.active {
          color: #7D2941;
          background-color: rgba(125, 41, 65, 0.08);
        }

        .btn-bookmark:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .btn-close {
          width: 44px;
          height: 44px;
          border: 0;
          background-color: transparent;
          border-radius: 8px;
          font-size: 1.4rem;
          color: #6B635E;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }

        .btn-close:hover {
          background-color: #EDE7DE;
          color: #262220;
        }

        .btn-close:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .modal-body {
          padding: 20px 20px 28px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .recipe-banner {
          width: 100%;
          max-height: 240px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #E8E2D9;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #7D2941;
          margin-bottom: 12px;
          border-bottom: 2px solid rgba(125, 41, 65, 0.12);
          padding-bottom: 6px;
        }

        .ingredients-list {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        @media screen and (min-width: 500px) {
          .ingredients-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .ingredient-item {
          background-color: #FAF7F2;
          border: 1px solid #E8E2D9;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 0.9rem;
          display: flex;
          gap: 8px;
          align-items: baseline;
        }

        .ingredient-measure {
          font-weight: 700;
          color: #7D2941;
          min-width: fit-content;
        }

        .ingredient-name {
          color: #262220;
          text-transform: capitalize;
        }

        .instructions-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .instruction-paragraph {
          font-size: 0.95rem;
          color: #262220;
          line-height: 1.7;
          text-align: left;
          max-width: 70ch;
        }

        .modal-footer {
          position: sticky;
          bottom: 0;
          z-index: 10;
          padding: 14px 20px;
          border-top: 1px solid #E8E2D9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background-color: #FAF7F2;
        }

        .btn-video {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          padding: 0 18px;
          background-color: #C4302B;
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 700;
          transition: background-color 0.2s ease;
        }

        .btn-video:hover {
          background-color: #A3241F;
        }

        .btn-video:focus-visible {
          outline: 2px solid #C4302B;
          outline-offset: 2px;
        }

        .video-icon {
          flex-shrink: 0;
        }

        .btn-secondary {
          min-height: 44px;
          padding: 0 20px;
          background-color: #E8E2D9;
          color: #262220;
          border: 0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .btn-secondary:hover {
          background-color: #DDD6CC;
        }

        .btn-secondary:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalRecipeTitle">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="header-title-container">
              <h2 id="modalRecipeTitle" class="modal-title">${escapeHtml(this._recipe.strMeal)}</h2>
              <div class="header-chips">
                ${categoryChip}
                ${areaChip}
              </div>
            </div>
            <div class="header-actions">
              <button
                class="btn-bookmark ${isSaved ? "active" : ""}"
                type="button"
                aria-label="${isSaved ? `Remove ${escapeHtml(this._recipe.strMeal)} from saved recipes` : `Save ${escapeHtml(this._recipe.strMeal)} to favorites`}"
                aria-pressed="${isSaved}"
                title="${isSaved ? "Remove from saved recipes" : "Save recipe"}"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="${isSaved ? "#7D2941" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              <button class="btn-close" type="button" aria-label="Close dialog">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <img
              class="recipe-banner"
              src="${escapeHtml(this._recipe.strMealThumb)}"
              alt="${escapeHtml(this._recipe.strMeal)}"
            />
            <div class="section-ingredients">
              <h3 class="section-title">Ingredients & Measures</h3>
              <ul class="ingredients-list">
                ${ingredientsHtml}
              </ul>
            </div>
            <div class="section-instructions">
              <h3 class="section-title">Cooking Instructions</h3>
              <div class="instructions-container">
                ${this._formatInstructions(this._recipe.strInstructions)}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            ${videoButton}
            <button class="btn-secondary btn-close-footer" type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    `;

    const overlay = this.shadowDOM.querySelector(".modal-overlay");
    const closeBtn = this.shadowDOM.querySelector(".btn-close");
    const closeFooterBtn = this.shadowDOM.querySelector(".btn-close-footer");
    const bookmarkBtn = this.shadowDOM.querySelector(".btn-bookmark");

    if (closeBtn) closeBtn.addEventListener("click", () => this.close());
    if (closeFooterBtn) closeFooterBtn.addEventListener("click", () => this.close());

    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", () => {
        storage.toggleSaveRecipe(this._recipe);
      });
    }

    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          this.close();
        }
      });
    }
  }
}

customElements.define("recipe-dialog", RecipeDialog);
// Alias for backward-compatibility with index.html <recipe-detail>
if (!customElements.get("recipe-detail")) {
  customElements.define("recipe-detail", class extends RecipeDialog {});
}
