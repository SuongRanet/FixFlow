import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import { useApiRequest } from "../../hooks/useApiRequest";
import { categoryApi, departmentApi } from "../../lib/api/endpoints";
import type { Option } from "../../types/api";
import { Select } from "../ui/Field";

type SelectProps = ComponentProps<"select"> & { hasError?: boolean };

interface OptionSelectProps extends SelectProps {
  /** Text for the empty first entry, e.g. "All departments". */
  placeholder: string;
  options: Option[];
  isLoading: boolean;
  loadError?: string;
}

/**
 * A <select> whose entries come from { name, id } objects:
 * the name is the label shown, the id is the value submitted.
 */
const OptionSelect = ({
  placeholder,
  options,
  isLoading,
  loadError,
  disabled,
  ...props
}: OptionSelectProps) => {
  const { t } = useTranslation();

  return (
    <Select {...props} disabled={disabled || isLoading || Boolean(loadError)}>
      <option value="">
        {isLoading
          ? t("common.loading")
          : loadError
            ? t("common.somethingWentWrong")
            : placeholder}
      </option>

      {options.map((option) => (
        <option key={option.id} value={String(option.id)}>
          {option.name}
        </option>
      ))}
    </Select>
  );
};

type ConnectedProps = SelectProps & { placeholder?: string };

/** Department dropdown, fed by GET /departments. */
export const DepartmentSelect = ({ placeholder, ...props }: ConnectedProps) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useApiRequest(departmentApi.list);

  return (
    <OptionSelect
      {...props}
      placeholder={placeholder ?? t("tickets.selectDepartment")}
      options={data ?? []}
      isLoading={isLoading}
      loadError={error}
    />
  );
};

/** Category dropdown, fed by GET /categories. */
export const CategorySelect = ({ placeholder, ...props }: ConnectedProps) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useApiRequest(categoryApi.list);

  return (
    <OptionSelect
      {...props}
      placeholder={placeholder ?? t("tickets.selectCategory")}
      options={data ?? []}
      isLoading={isLoading}
      loadError={error}
    />
  );
};
