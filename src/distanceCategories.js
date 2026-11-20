// Afstandscategorieën staan in de database (distance_groups, distance_categories,
// koppeltabel event_distance_categories). Zie From_Claude/events-distance-categories.sql.
// Lijsten en namen komen uit de stamtabellen via useMasterData() (masterData.jsx).

// Haal je events op met dit stuk erbij: .select(`*, ${EVENT_CATEGORIES_SELECT}`)
export const EVENT_CATEGORIES_SELECT =
  "event_distance_categories(category_code, distance_categories(sort_order, is_active))"

// Groepen met hun actieve categorieën: [{ code, categories: [code, …] }]
// active = useMasterData().active
export function distanceGroups(active) {
  const categories = active("distanceCategories")
  return active("distanceGroups")
    .map((group) => ({
      code: group.code,
      categories: categories.filter((c) => c.group_code === group.code).map((c) => c.code),
    }))
    .filter((group) => group.categories.length > 0)
}

// Actieve categorieën van een opgehaald event, op volgorde
export function eventCategories(event) {
  const links = Array.isArray(event?.event_distance_categories) ? event.event_distance_categories : []
  return links
    .filter((l) => l.distance_categories?.is_active !== false)
    .sort((a, b) => (a.distance_categories?.sort_order ?? 0) - (b.distance_categories?.sort_order ?? 0))
    .map((l) => l.category_code)
}
