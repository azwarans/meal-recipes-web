import "./recipe-card.js";
import storage from "../services/storage.js";

const OFFICIAL_CATEGORIES = [
  "All",
  "Beef",
  "Breakfast",
  "Chicken",
  "Dessert",
  "Goat",
  "Lamb",
  "Miscellaneous",
  "Pasta",
  "Pork",
  "Seafood",
  "Side",
  "Starter",
  "Vegan",
  "Vegetarian"
];

class RecipeList extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this._state = "idle"; // "idle" | "loading" | "featured" | "results" | "category" | "no-results" | "request-error"
    this._currentView = "all"; // "all" | "saved"
    this._currentCategory = "All";
    this._recipes = [];
    this._displayedCount = 12;
    this._keyword = "";
    this._onRetryCallback = null;
    this._onSavedUpdate = this._onSavedUpdate.bind(this);
  }

  connectedCallback() {
    document.addEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  disconnectedCallback() {
    document.removeEventListener("saved-recipes-updated", this._onSavedUpdate);
  }

  _onSavedUpdate() {
    const saved = storage.getSavedRecipes();
    const savedTab = this.shadowDOM.querySelector("#tab-saved");
    if (savedTab) {
      savedTab.textContent = `Saved Recipes (${saved.length})`;
    }

    if (this._currentView === "saved") {
      this._renderCardsView();
    }
  }

  // Backward compatibility setter for legacy callers
  set foods(foods) {
    this.renderResults(foods || [], this._keyword);
  }

  renderLoading() {
    this._state = "loading";
    this.shadowDOM.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          display: block;
          width: 100%;
          padding: 60px 20px;
          text-align: center;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .loading-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(125, 41, 65, 0.15);
          border-top-color: #7D2941;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .loading-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #7D2941;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="loading-box" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p class="loading-text">Finding the best recipes for you...</p>
      </div>
    `;
  }

  renderFeatured(recipes = [], initialCount = 12) {
    this._state = "featured";
    this._currentView = "all";
    this._currentCategory = "All";
    this._recipes = recipes;
    this._displayedCount = initialCount;
    this._keyword = "";
    this._renderCardsView();
  }

  renderResults(recipes = [], keyword = "") {
    this._state = "results";
    this._currentView = "all";
    this._currentCategory = "All";
    this._recipes = recipes;
    this._displayedCount = recipes.length;
    this._keyword = keyword;
    this._renderCardsView();
  }

  renderCategoryResults(recipes = [], category = "") {
    this._state = "category";
    this._currentView = "all";
    this._currentCategory = category || "All";
    this._recipes = recipes;
    this._displayedCount = recipes.length;
    this._keyword = "";
    this._renderCardsView();
  }

  renderNoResults(keyword = "") {
    this._state = "no-results";
    this._keyword = keyword;

    this.shadowDOM.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          display: block;
          width: 100%;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .status-panel {
          width: 100%;
          max-width: 620px;
          margin: 48px auto;
          padding: 40px 24px;
          text-align: center;
          background-color: #FFFFFF;
          border: 1px solid #E8E2D9;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(38, 34, 32, 0.05);
        }
        .status-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #7D2941;
          margin-bottom: 10px;
        }
        .status-desc {
          font-size: 0.98rem;
          color: #6B635E;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .suggestion-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #262220;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .chips-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .chip {
          background-color: rgba(125, 41, 65, 0.08);
          color: #7D2941;
          border: 1px solid rgba(125, 41, 65, 0.15);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .chip:hover {
          background-color: #7D2941;
          color: #FFFFFF;
        }
        .chip:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
      </style>
      <div class="status-panel" role="alert">
        <h2 class="status-title">No Recipes Found</h2>
        <p class="status-desc">
          We couldn't find any recipes matching "${keyword}". Try searching with different keywords like Chicken, Pasta, or Soup.
        </p>
        <p class="suggestion-title">Suggested Searches</p>
        <div class="chips-container">
          <button class="chip" type="button" data-keyword="Chicken">Chicken</button>
          <button class="chip" type="button" data-keyword="Pasta">Pasta</button>
          <button class="chip" type="button" data-keyword="Soup">Soup</button>
          <button class="chip" type="button" data-keyword="Beef">Beef</button>
          <button class="chip" type="button" data-keyword="Dessert">Dessert</button>
        </div>
      </div>
    `;

    const chips = this.shadowDOM.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const selectedKeyword = chip.getAttribute("data-keyword");
        this.dispatchEvent(
          new CustomEvent("suggestion-selected", {
            detail: selectedKeyword,
            bubbles: true,
            composed: true
          })
        );
      });
    });
  }

  renderRequestError(errorMessage = "", onRetry = null) {
    this._state = "request-error";
    this._onRetryCallback = onRetry;

    this.shadowDOM.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          display: block;
          width: 100%;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .status-panel {
          width: 100%;
          max-width: 620px;
          margin: 48px auto;
          padding: 40px 24px;
          text-align: center;
          background-color: #FFFFFF;
          border: 1px solid #E8E2D9;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(38, 34, 32, 0.05);
        }
        .status-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #7D2941;
          margin-bottom: 10px;
        }
        .status-desc {
          font-size: 0.98rem;
          color: #6B635E;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .btn-retry {
          min-height: 44px;
          padding: 0 28px;
          background-color: #7D2941;
          color: #FFFFFF;
          border: 0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn-retry:hover {
          background-color: #631F32;
        }
        .btn-retry:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
      </style>
      <div class="status-panel" role="alert">
        <h2 class="status-title">Unable to Load Recipes</h2>
        <p class="status-desc">
          ${errorMessage || "Something went wrong while connecting to the recipe service. Please check your internet connection."}
        </p>
        ${
          this._onRetryCallback
            ? `<button class="btn-retry" type="button">Try Again</button>`
            : ""
        }
      </div>
    `;

    const retryBtn = this.shadowDOM.querySelector(".btn-retry");
    if (retryBtn && this._onRetryCallback) {
      retryBtn.addEventListener("click", () => this._onRetryCallback());
    }
  }

  // Backward compatibility alias for renderError
  renderError(message) {
    this.renderRequestError(message);
  }

  _renderCardsView() {
    const savedRecipes = storage.getSavedRecipes();
    const savedCount = savedRecipes.length;
    const isSavedView = this._currentView === "saved";

    let displayList = [];
    let sectionTitle = "";
    let sectionSubtitle = "";
    let hasMore = false;
    let remainingCount = 0;

    if (isSavedView) {
      displayList = savedRecipes;
      sectionTitle = "Saved Recipes";
      sectionSubtitle =
        savedCount === 0
          ? "Your bookmarked recipe collection"
          : `${savedCount} recipe${savedCount === 1 ? "" : "s"} saved for your cooking inspiration`;
    } else {
      const isFeatured = this._state === "featured";
      const isCategory = this._state === "category";
      const totalRecipes = this._recipes.length;

      if (isCategory) {
        displayList = this._recipes;
        sectionTitle = `${this._currentCategory} Recipes`;
        sectionSubtitle = `${totalRecipes} recipe${totalRecipes === 1 ? "" : "s"} found in ${this._currentCategory}`;
      } else if (isFeatured) {
        displayList = this._recipes.slice(0, this._displayedCount);
        hasMore = this._displayedCount < totalRecipes;
        remainingCount = totalRecipes - this._displayedCount;
        sectionTitle = "Featured Recipes";
        sectionSubtitle = "Popular culinary inspirations from around the world";
      } else {
        displayList = this._recipes.slice(0, this._displayedCount);
        sectionTitle = `Search Results for "${this._keyword}"`;
        sectionSubtitle = `${totalRecipes} recipe${totalRecipes === 1 ? "" : "s"} found`;
      }
    }

    this.shadowDOM.innerHTML = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :host {
          display: block;
          width: 100%;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .view-tabs {
          display: inline-flex;
          background-color: #EDE7DE;
          border-radius: 24px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 20px;
        }
        .tab-btn {
          border: 0;
          background: transparent;
          color: #6B635E;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 700;
          padding: 8px 18px;
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }
        .tab-btn:hover {
          color: #262220;
        }
        .tab-btn.active {
          background-color: #FFFFFF;
          color: #7D2941;
          box-shadow: 0 1px 4px rgba(38, 34, 32, 0.1);
        }
        .tab-btn:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .category-filter-wrapper {
          margin-bottom: 24px;
        }
        .category-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #E8E2D9 transparent;
        }
        .category-pills::-webkit-scrollbar {
          height: 4px;
        }
        .category-pills::-webkit-scrollbar-thumb {
          background-color: #E8E2D9;
          border-radius: 4px;
        }
        .category-pill {
          white-space: nowrap;
          border: 1px solid #E2D9CE;
          background-color: #FAF7F2;
          color: #554D46;
          font-family: inherit;
          font-size: 0.86rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
        }
        .category-pill:hover {
          background-color: #EDE7DE;
          color: #262220;
          border-color: #CFC2B4;
        }
        .category-pill.active {
          background-color: #7D2941;
          color: #FFFFFF;
          border-color: #7D2941;
          box-shadow: 0 1px 4px rgba(125, 41, 65, 0.2);
        }
        .category-pill:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .section-header {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #262220;
          margin-bottom: 4px;
        }
        .section-subtitle {
          font-size: 0.95rem;
          color: #6B635E;
        }
        .recipes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
        }
        @media screen and (min-width: 600px) {
          .recipes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media screen and (min-width: 960px) {
          .recipes-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
        }
        .empty-saved {
          width: 100%;
          max-width: 620px;
          margin: 32px auto 48px;
          padding: 44px 24px;
          text-align: center;
          background-color: #FFFFFF;
          border: 1px solid #E8E2D9;
          border-radius: 12px;
          box-shadow: 0 4px 14px rgba(38, 34, 32, 0.05);
        }
        .empty-saved-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .empty-saved-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #7D2941;
          margin-bottom: 10px;
        }
        .empty-saved-desc {
          font-size: 0.98rem;
          color: #6B635E;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .btn-explore {
          min-height: 44px;
          padding: 0 28px;
          background-color: #7D2941;
          color: #FFFFFF;
          border: 0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn-explore:hover {
          background-color: #631F32;
        }
        .btn-explore:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
        .show-more-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 36px;
        }
        .btn-show-more {
          min-height: 48px;
          padding: 0 32px;
          background-color: #FFFFFF;
          color: #7D2941;
          border: 2px solid #7D2941;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.96rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .btn-show-more:hover {
          background-color: #7D2941;
          color: #FFFFFF;
        }
        .btn-show-more:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
      </style>
      <div class="cards-view">
        <div class="view-tabs" role="tablist" aria-label="Recipe views">
          <button
            type="button"
            class="tab-btn ${!isSavedView ? "active" : ""}"
            id="tab-all"
            role="tab"
            aria-selected="${!isSavedView}"
          >
            All Recipes
          </button>
          <button
            type="button"
            class="tab-btn ${isSavedView ? "active" : ""}"
            id="tab-saved"
            role="tab"
            aria-selected="${isSavedView}"
          >
            Saved Recipes (${savedCount})
          </button>
        </div>

        ${
          !isSavedView
            ? `
          <div class="category-filter-wrapper">
            <div class="category-pills" role="tablist" aria-label="Explore by category">
              ${OFFICIAL_CATEGORIES.map(
                (cat) => `
                <button
                  type="button"
                  class="category-pill ${this._currentCategory === cat ? "active" : ""}"
                  data-category="${cat}"
                  role="tab"
                  aria-selected="${this._currentCategory === cat}"
                >
                  ${cat === "All" ? "All Categories" : cat}
                </button>
              `
              ).join("")}
            </div>
          </div>
        `
            : ""
        }

        <header class="section-header">
          <h2 class="section-title">${sectionTitle}</h2>
          <p class="section-subtitle">${sectionSubtitle}</p>
        </header>

        ${
          isSavedView && savedCount === 0
            ? `
          <div class="empty-saved">
            <div class="empty-saved-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#7D2941" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 class="empty-saved-title">No Saved Recipes Yet</h3>
            <p class="empty-saved-desc">
              You haven't bookmarked any recipes yet. Explore recipes and tap the bookmark icon on any recipe card to save your favorites here.
            </p>
            <button class="btn-explore" type="button">Explore Recipes</button>
          </div>
        `
            : `
          <div class="recipes-grid"></div>
        `
        }

        ${
          !isSavedView && hasMore
            ? `
          <div class="show-more-wrapper">
            <button class="btn-show-more" type="button">
              Show More Recipes (${remainingCount} more)
            </button>
          </div>
        `
            : ""
        }
      </div>
    `;

    // Populate grid if not empty saved
    const grid = this.shadowDOM.querySelector(".recipes-grid");
    if (grid && displayList.length > 0) {
      displayList.forEach((item) => {
        const card = document.createElement("recipe-card");
        card.food = item;
        grid.appendChild(card);
      });
    }

    // Category pills event listeners
    const categoryPills = this.shadowDOM.querySelectorAll(".category-pill");
    categoryPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const cat = pill.getAttribute("data-category");
        if (cat === this._currentCategory && this._state === "category") return;
        this.dispatchEvent(
          new CustomEvent("category-selected", {
            detail: { category: cat },
            bubbles: true,
            composed: true
          })
        );
      });
    });

    // Tab buttons event listeners
    const tabAll = this.shadowDOM.querySelector("#tab-all");
    const tabSaved = this.shadowDOM.querySelector("#tab-saved");

    if (tabAll) {
      tabAll.addEventListener("click", () => {
        if (this._currentView !== "all") {
          this._currentView = "all";
          this._renderCardsView();
        }
      });
    }

    if (tabSaved) {
      tabSaved.addEventListener("click", () => {
        if (this._currentView !== "saved") {
          this._currentView = "saved";
          this._renderCardsView();
        }
      });
    }

    const exploreBtn = this.shadowDOM.querySelector(".btn-explore");
    if (exploreBtn) {
      exploreBtn.addEventListener("click", () => {
        this._currentView = "all";
        this._renderCardsView();
      });
    }

    const showMoreBtn = this.shadowDOM.querySelector(".btn-show-more");
    if (showMoreBtn) {
      showMoreBtn.addEventListener("click", () => {
        this._displayedCount = this._recipes.length;
        this._renderCardsView();
      });
    }
  }
}

customElements.define("recipe-list", RecipeList);
// Alias for backward-compatibility with <food-list>
if (!customElements.get("food-list")) {
  customElements.define("food-list", class extends RecipeList {});
}
