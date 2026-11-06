import storage from "../services/storage.js";

class RecipeCard extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this._food = null;
    this._onSavedUpdate = this._onSavedUpdate.bind(this);
  }

  connectedCallback() {
    document.addEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  disconnectedCallback() {
    document.removeEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  _onSavedUpdate(e) {
    if (this._food && e.detail && String(e.detail.idMeal) === String(this._food.idMeal)) {
      this._updateBookmarkState(e.detail.isSaved);
    }
  }

  _updateBookmarkState(isSaved) {
    const btn = this.shadowDOM.querySelector(".btn-bookmark");
    if (!btn || !this._food) return;

    btn.classList.toggle("active", isSaved);
    btn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      isSaved
        ? `Remove ${this._food.strMeal} from saved recipes`
        : `Save ${this._food.strMeal} to favorites`
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

  set food(food) {
    this._food = food;
    this.render();
  }

  get food() {
    return this._food;
  }

  render() {
    if (!this._food) return;

    const isSaved = storage.isRecipeSaved(this._food.idMeal);

    const categoryTag = this._food.strCategory
      ? `<span class="badge badge-category">${this._food.strCategory}</span>`
      : "";

    const areaTag = this._food.strArea
      ? `<span class="badge badge-area">${this._food.strArea}</span>`
      : "";

    this.shadowDOM.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :host {
          display: flex;
          flex-direction: column;
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E8E2D9;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(38, 34, 32, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
        }

        :host(:hover) {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(38, 34, 32, 0.12);
        }

        .img-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background-color: #EDE7DE;
        }

        .food-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        :host(:hover) .food-thumb {
          transform: scale(1.03);
        }

        .btn-bookmark {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #6B635E;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 8px rgba(38, 34, 32, 0.12);
          z-index: 2;
        }

        .btn-bookmark:hover {
          background-color: #FFFFFF;
          color: #7D2941;
          transform: scale(1.08);
          box-shadow: 0 4px 12px rgba(38, 34, 32, 0.18);
        }

        .btn-bookmark.active {
          color: #7D2941;
          background-color: #FAF5F2;
        }

        .btn-bookmark:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .food-content {
          padding: 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .badges-container {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.2px;
          text-transform: capitalize;
        }

        .badge-category {
          background-color: rgba(125, 41, 65, 0.09);
          color: #7D2941;
        }

        .badge-area {
          background-color: #F1ECE4;
          color: #554D46;
        }

        .food-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #262220;
          line-height: 1.35;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-view-recipe {
          margin-top: auto;
          width: 100%;
          min-height: 44px;
          background-color: #7D2941;
          color: #FFFFFF;
          border: 0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-view-recipe:hover {
          background-color: #631F32;
        }

        .btn-view-recipe:active {
          transform: scale(0.98);
        }

        .btn-view-recipe:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
      </style>
      <div class="img-container">
        <img
          class="food-thumb"
          src="${this._food.strMealThumb}"
          alt="${this._food.strMeal}"
          loading="lazy"
        />
        <button
          class="btn-bookmark ${isSaved ? "active" : ""}"
          type="button"
          aria-label="${isSaved ? `Remove ${this._food.strMeal} from saved recipes` : `Save ${this._food.strMeal} to favorites`}"
          aria-pressed="${isSaved}"
          title="${isSaved ? "Remove from saved recipes" : "Save recipe"}"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? "#7D2941" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
      <div class="food-content">
        <div class="badges-container">
          ${categoryTag}
          ${areaTag}
        </div>
        <h3 class="food-title">${this._food.strMeal}</h3>
        <button
          class="btn-view-recipe"
          type="button"
          aria-label="View Recipe: ${this._food.strMeal}"
        >
          View Recipe
        </button>
      </div>
    `;

    const viewButton = this.shadowDOM.querySelector(".btn-view-recipe");
    if (viewButton) {
      viewButton.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("recipe-selected", {
            detail: {
              recipe: this._food,
              triggerElement: viewButton
            },
            bubbles: true,
            composed: true
          })
        );
      });
    }

    const bookmarkBtn = this.shadowDOM.querySelector(".btn-bookmark");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        storage.toggleSaveRecipe(this._food);
      });
    }
  }
}

customElements.define("recipe-card", RecipeCard);
// Alias for backward-compatibility with <food-item>
if (!customElements.get("food-item")) {
  customElements.define("food-item", class extends RecipeCard {});
}
