import { getDepartmentsRepository } from "./department.repository.js";

/**
 * Returns departments as { name, id } pairs so clients can render a
 * dropdown directly: the name is the label, the id is the value.
 */
export const getDepartmentsService = async () => {
  const departments = await getDepartmentsRepository();

  return departments.map((department) => ({
    name: department.name,
    id: Number(department.id),
  }));
};
