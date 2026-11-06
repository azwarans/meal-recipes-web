class HeroSearch extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this._currentQuery = "";
  }

  connectedCallback() {
    this.render();
  }

  set clickEvent(event) {
    this._clickEvent = event;
    const searchButton = this.shadowDOM.querySelector("#searchButtonElement");
    if (searchButton) {
      searchButton.onclick = this._clickEvent;
    }
  }

  get value() {
    const input = this.shadowDOM.querySelector("#searchElement");
    return input ? input.value : "";
  }

  set value(val) {
    this._currentQuery = val || "";
    const input = this.shadowDOM.querySelector("#searchElement");
    if (input) {
      input.value = this._currentQuery;
    }
  }

  showValidation(message) {
    const feedbackEl = this.shadowDOM.querySelector(".search-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = message || "Please enter a recipe name or ingredient to search.";
      feedbackEl.classList.add("visible");
      const input = this.shadowDOM.querySelector("#searchElement");
      if (input) {
        input.focus();
      }
    }
  }

  clearValidation() {
    const feedbackEl = this.shadowDOM.querySelector(".search-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = "";
      feedbackEl.classList.remove("visible");
    }
  }

  setSurpriseLoading(isLoading) {
    const btn = this.shadowDOM.querySelector("#surpriseButtonElement");
    if (!btn) return;
    btn.disabled = !!isLoading;
    const label = btn.querySelector("span");
    if (label) {
      label.textContent = isLoading ? "Finding..." : "Surprise Me";
    }
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
          display: block;
          width: 100%;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          scroll-margin-top: 76px;
        }

        .hero-section {
          width: 100%;
          background: linear-gradient(135deg, rgba(82, 22, 38, 0.94) 0%, rgba(125, 41, 65, 0.88) 100%),
                      url('./img/Meals-unsplash.jpg') center/cover no-repeat;
          padding: 44px 20px 36px;
          color: #FFFFFF;
          text-align: center;
          position: relative;
        }

        .hero-title {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          line-height: 1.25;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: #F5EFEB;
          max-width: 620px;
          margin: 0 auto 24px;
          line-height: 1.5;
          font-weight: 400;
          opacity: 0.95;
        }

        .search-wrapper {
          max-width: 680px;
          margin: 0 auto;
        }

        .search-container {
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border-radius: 10px;
          padding: 4px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22);
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
          border: 2px solid transparent;
          gap: 6px;
        }

        .search-container:focus-within {
          border-color: #7D2941;
          box-shadow: 0 10px 30px rgba(125, 41, 65, 0.28);
        }

        .search-input {
          flex: 1;
          min-width: 0;
          padding: 12px 16px;
          border: 0;
          background: transparent;
          font-size: 1rem;
          font-family: inherit;
          font-weight: 600;
          color: #262220;
          outline: none;
        }

        .search-input::placeholder {
          color: #8C827A;
          font-weight: 400;
        }

        .search-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .search-btn {
          min-height: 44px;
          padding: 0 22px;
          background-color: #7D2941;
          color: #FFFFFF;
          border: 0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
          white-space: nowrap;
        }

        .search-btn:hover {
          background-color: #631F32;
        }

        .search-btn:active {
          transform: scale(0.98);
        }

        .search-btn:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .surprise-btn {
          min-height: 44px;
          padding: 0 16px;
          background-color: #F7F3EE;
          color: #7D2941;
          border: 1px solid #E2D9CE;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .surprise-btn:hover:not(:disabled) {
          background-color: #EDE5D8;
          border-color: #CFC2B4;
        }

        .surprise-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .surprise-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .surprise-btn:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }

        .search-feedback {
          display: none;
          margin-top: 8px;
          background-color: #FFF2F4;
          color: #A31D33;
          border: 1px solid #F5C6CE;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          text-align: left;
        }

        .search-feedback.visible {
          display: block;
          animation: fadeIn 0.2s ease-out;
        }

        .hero-hint {
          font-size: 0.84rem;
          color: #EAD0D8;
          margin-top: 10px;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media screen and (max-width: 560px) {
          .hero-section {
            padding: 32px 16px 28px;
          }

          .search-container {
            flex-direction: column;
            padding: 8px;
            gap: 8px;
          }

          .search-input {
            width: 100%;
            padding: 10px 12px;
          }

          .search-actions {
            width: 100%;
            display: flex;
            gap: 8px;
          }

          .search-btn {
            flex: 1;
            height: 44px;
          }

          .surprise-btn {
            flex: 1;
            height: 44px;
            justify-content: center;
          }
        }
      </style>
      <section class="hero-section">
        <h1 class="hero-title">Find Your Favorite Meal Recipes</h1>
        <p class="hero-subtitle">Explore delicious dishes with ingredients and detailed cooking steps</p>
        <div class="search-wrapper">
          <div id="search-container" class="search-container">
            <input
              id="searchElement"
              class="search-input"
              type="search"
              placeholder="Search recipes (e.g. Chicken, Pasta, Soup)..."
              aria-label="Search recipes"
              value="${this._currentQuery}"
            />
            <div class="search-actions">
              <button id="searchButtonElement" class="search-btn" type="submit">
                Search
              </button>
              <button
                id="surpriseButtonElement"
                class="surprise-btn"
                type="button"
                aria-label="Surprise me with a random recipe"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span>Surprise Me</span>
              </button>
            </div>
          </div>
          <div class="search-feedback" role="alert"></div>
          <p class="hero-hint">Search recipes by name or tap Surprise Me for instant inspiration</p>
        </div>
      </section>
    `;

    const searchButton = this.shadowDOM.querySelector("#searchButtonElement");
    const searchInput = this.shadowDOM.querySelector("#searchElement");
    const surpriseButton = this.shadowDOM.querySelector("#surpriseButtonElement");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this._currentQuery = searchInput.value;
        this.clearValidation();
      });

      searchInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter" && this._clickEvent) {
          this.clearValidation();
          this._clickEvent();
        }
      });
    }

    if (this._clickEvent && searchButton) {
      searchButton.onclick = () => {
        this.clearValidation();
        this._clickEvent();
      };
    }

    if (surpriseButton) {
      surpriseButton.addEventListener("click", () => {
        this.clearValidation();
        this.dispatchEvent(
          new CustomEvent("surprise-recipe", {
            bubbles: true,
            composed: true
          })
        );
      });
    }
  }
}

customElements.define("hero-search", HeroSearch);
// Alias for backward-compatibility with <jtron-bar>
if (!customElements.get("jtron-bar")) {
  customElements.define("jtron-bar", class extends HeroSearch {});
}
