class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
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
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 60px;
          background-color: #7D2941;
          color: #FFFFFF;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
          z-index: 100;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header-container {
          max-width: 1200px;
          height: 60px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .brand-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #FFFFFF;
          padding: 6px 8px;
          margin-left: -8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .brand-link:hover {
          background-color: rgba(255, 255, 255, 0.12);
        }

        .brand-link:focus-visible {
          outline: 2px solid #FFFFFF;
          outline-offset: 2px;
        }

        .brand-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 6px;
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: #FFFFFF;
        }
      </style>
      <header class="header-container">
        <a href="#" class="brand-link" aria-label="Meal Recipes Home">
          <img class="brand-logo" src="./img/icon.png" alt="Meal Recipes Logo" />
          <h2 class="brand-title">Meal Recipes</h2>
        </a>
      </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
// Alias for backward-compatibility with index.html <top-bar>
if (!customElements.get("top-bar")) {
  customElements.define("top-bar", class extends AppHeader {});
}
