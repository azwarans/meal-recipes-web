const SAVED_RECIPES_KEY = "meal_recipes_saved";

class StorageService {
  getSavedRecipes() {
    try {
      if (typeof localStorage === "undefined") return [];
      const data = localStorage.getItem(SAVED_RECIPES_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Error reading saved recipes from localStorage:", e);
      return [];
    }
  }

  isRecipeSaved(idMeal) {
    if (!idMeal) return false;
    const saved = this.getSavedRecipes();
    return saved.some((meal) => String(meal.idMeal) === String(idMeal));
  }

  toggleSaveRecipe(recipe) {
    if (!recipe || !recipe.idMeal) return false;
    try {
      const saved = this.getSavedRecipes();
      const index = saved.findIndex(
        (meal) => String(meal.idMeal) === String(recipe.idMeal)
      );
      let isSaved = false;

      if (index >= 0) {
        saved.splice(index, 1);
        isSaved = false;
      } else {
        saved.unshift(recipe);
        isSaved = true;
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved));
      }

      if (typeof document !== "undefined") {
        document.dispatchEvent(
          new CustomEvent("saved-recipes-updated", {
            detail: {
              recipe,
              idMeal: recipe.idMeal,
              isSaved,
              savedRecipes: saved
            }
          })
        );
      }

      return isSaved;
    } catch (e) {
      console.error("Error saving recipe to localStorage:", e);
      return false;
    }
  }
}

export const storage = new StorageService();
export default storage;
