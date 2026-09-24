import { getCategoriesRepository } from "./category.repository.js";

/**
 * Returns categories as { name, id } pairs so clients can render a
 * dropdown directly: the name is the label, the id is the value.
 * The description rides along for tooltips and help text.
 */
export const getCategoriesService = async () => {
  const categories = await getCategoriesRepository();

  return categories.map((category) => ({
    name: category.name,
    id: Number(category.id),
    description: category.description ?? null,
  }));
};
