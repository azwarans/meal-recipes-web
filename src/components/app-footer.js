class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const currentYear = new Date().getFullYear();

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
          background-color: #F5EFEB;
          border-top: 1px solid #E8E2D9;
          color: #6B635E;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
        }

        .footer-brand {
          font-size: 1.15rem;
          font-weight: 700;
          color: #7D2941;
          letter-spacing: 0.2px;
        }

        .footer-desc {
          font-size: 0.9rem;
          color: #6B635E;
          max-width: 500px;
          line-height: 1.5;
        }

        .footer-divider {
          width: 48px;
          height: 2px;
          background-color: #E8E2D9;
          margin: 4px 0;
        }

        .footer-copy {
          font-size: 0.85rem;
          color: #8C847E;
          line-height: 1.6;
        }

        .footer-link {
          color: #7D2941;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease, text-decoration 0.2s ease;
        }

        .footer-link:hover {
          text-decoration: underline;
          color: #631F32;
        }

        .footer-link:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
          border-radius: 2px;
        }

        .back-to-top {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #7D2941;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          margin-top: 6px;
          padding: 6px 12px;
          border-radius: 4px;
          transition: color 0.2s ease, text-decoration 0.2s ease;
        }

        .back-to-top:hover {
          color: #631F32;
          text-decoration: underline;
        }

        .back-to-top:focus-visible {
          outline: 2px solid #7D2941;
          outline-offset: 2px;
        }
      </style>
      <footer class="footer-container">
        <h3 class="footer-brand">Meal Recipes</h3>
        <p class="footer-desc">Explore recipes from around the world.</p>
        <div class="footer-divider" role="separator" aria-hidden="true"></div>
        <p class="footer-copy">
          &copy; ${currentYear} azwarans. Recipe data provided by
          <a
            class="footer-link"
            href="https://www.themealdb.com/"
            target="_blank"
            rel="noopener noreferrer"
          >TheMealDB</a>.
        </p>
        <a href="#top" class="back-to-top" aria-label="Back to top of page">Back to top ↑</a>
      </footer>
    `;

    const backToTopLink = this.shadowDOM.querySelector(".back-to-top");
    if (backToTopLink) {
      backToTopLink.addEventListener("click", (event) => {
        event.preventDefault();
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });

        const topTarget = document.querySelector("#top") || document.body;
        if (topTarget && typeof topTarget.focus === "function") {
          topTarget.focus();
        }
      });
    }
  }
}

customElements.define("app-footer", AppFooter);
