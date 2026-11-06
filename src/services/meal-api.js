class MealApi {
  static async searchMeals(keyword = "") {
    const sanitized = keyword ? keyword.trim() : "";
    const query = encodeURIComponent(sanitized);

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.meals || [];
  }

  static async filterByCategory(category = "") {
    const sanitized = category ? category.trim() : "";
    const query = encodeURIComponent(sanitized);

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${query}`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const meals = data.meals || [];
    return meals.map((m) => ({
      ...m,
      strCategory: m.strCategory || sanitized
    }));
  }

  static async getMealById(idMeal) {
    if (!idMeal) return null;
    const query = encodeURIComponent(String(idMeal).trim());

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${query}`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.meals && data.meals.length > 0 ? data.meals[0] : null;
  }

  static async getRandomMeal() {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.meals && data.meals.length > 0 ? data.meals[0] : null;
  }
}

export default MealApi;
