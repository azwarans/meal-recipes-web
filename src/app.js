import MealApi from "./services/meal-api.js";

const app = () => {
  // Enforce English document language and clear obsolete language preferences
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("lang", "en");
  }
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("webrecipe_lang");
  }

  const heroSearch = document.querySelector("hero-search") || document.querySelector("jtron-bar");
  const recipeList = document.querySelector("recipe-list") || document.querySelector("food-list");
  const recipeDialog = document.querySelector("recipe-dialog") || document.querySelector("recipe-detail");

  const loadInitialFeatured = async () => {
    if (!recipeList) return;
    recipeList.renderLoading();

    try {
      const meals = await MealApi.searchMeals("");
      recipeList.renderFeatured(meals, 12);
    } catch (err) {
      recipeList.renderRequestError(err.message, loadInitialFeatured);
    }
  };

  const handleSearch = async (queryOverride) => {
    const rawKeyword =
      typeof queryOverride === "string" ? queryOverride : heroSearch ? heroSearch.value : "";
    const keyword = rawKeyword.trim();

    if (!keyword) {
      if (heroSearch && typeof heroSearch.showValidation === "function") {
        heroSearch.showValidation("Please enter a recipe name or ingredient to search.");
      }
      return;
    }

    if (heroSearch && typeof heroSearch.clearValidation === "function") {
      heroSearch.clearValidation();
    }

    if (recipeList) {
      recipeList.renderLoading();
    }

    try {
      const meals = await MealApi.searchMeals(keyword);
      if (!meals || meals.length === 0) {
        if (recipeList) {
          recipeList.renderNoResults(keyword);
        }
      } else {
        if (recipeList) {
          recipeList.renderResults(meals, keyword);
        }
      }
    } catch (err) {
      if (recipeList) {
        recipeList.renderRequestError(err.message, () => handleSearch(keyword));
      }
    }
  };

  if (heroSearch) {
    heroSearch.clickEvent = () => handleSearch();
  }

  // Handle recipe selection to open dialog (with on-demand detail lookup if needed)
  document.addEventListener("recipe-selected", async (event) => {
    if (recipeDialog && event.detail) {
      let recipeData = event.detail.recipe || event.detail;
      const triggerEl = event.detail.triggerElement || null;

      // If recipe object lacks instructions (e.g. from filter.php), fetch full recipe details
      if (!recipeData.strInstructions && recipeData.idMeal) {
        try {
          const fullRecipe = await MealApi.getMealById(recipeData.idMeal);
          if (fullRecipe) {
            recipeData = fullRecipe;
          }
        } catch (err) {
          console.warn("Failed to fetch full recipe details:", err);
        }
      }

      recipeDialog.show(recipeData, triggerEl);
    }
  });

  // Handle category selection
  document.addEventListener("category-selected", async (event) => {
    const category = event.detail ? event.detail.category : "All";

    if (heroSearch && typeof heroSearch.clearValidation === "function") {
      heroSearch.clearValidation();
    }

    if (category === "All") {
      loadInitialFeatured();
      return;
    }

    if (recipeList) {
      recipeList.renderLoading();
    }

    try {
      const meals = await MealApi.filterByCategory(category);
      if (recipeList) {
        if (!meals || meals.length === 0) {
          recipeList.renderNoResults(category);
        } else {
          recipeList.renderCategoryResults(meals, category);
        }
      }
    } catch (err) {
      if (recipeList) {
        recipeList.renderRequestError(err.message, () => {
          document.dispatchEvent(
            new CustomEvent("category-selected", { detail: { category } })
          );
        });
      }
    }
  });

  // Handle "Surprise Me" random recipe action
  document.addEventListener("surprise-recipe", async () => {
    if (heroSearch && typeof heroSearch.setSurpriseLoading === "function") {
      heroSearch.setSurpriseLoading(true);
    }

    try {
      const randomMeal = await MealApi.getRandomMeal();
      if (randomMeal && recipeDialog) {
        const surpriseBtn =
          heroSearch && heroSearch.shadowDOM
            ? heroSearch.shadowDOM.querySelector("#surpriseButtonElement")
            : null;
        recipeDialog.show(randomMeal, surpriseBtn);
      }
    } catch (err) {
      if (heroSearch && typeof heroSearch.showValidation === "function") {
        heroSearch.showValidation(
          "Unable to fetch a surprise recipe. Please check your connection."
        );
      }
    } finally {
      if (heroSearch && typeof heroSearch.setSurpriseLoading === "function") {
        heroSearch.setSurpriseLoading(false);
      }
    }
  });

  // Handle keyword chip suggestions
  document.addEventListener("suggestion-selected", (event) => {
    const keyword = event.detail;
    if (heroSearch) {
      heroSearch.value = keyword;
    }
    handleSearch(keyword);
  });

  // Start with initial featured meals
  loadInitialFeatured();
};

export default app;
