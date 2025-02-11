import { default as Select, StylesConfig } from "react-select";

interface StyleOption {
  value: string;
  label: React.JSX.Element;
}

const customStyles: StylesConfig<StyleOption, false> = {
  control: (provided, state) => ({
    ...provided,
    width: "100%",
    padding: "6px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
    boxShadow: state.isFocused ? "0 0 0 2px #3B82F6" : "none",
    "&:hover": {
      borderColor: "#3B82F6",
    },
  }),
};
const SelectInput = ({
  label,
  options,
  value,
  onChange,
  error,
  ...props
}: {
  label: string;
  options: StyleOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  [key: string]: unknown;
}) => (
  <div className="flex flex-col gap-1">
    <label className="block text-sm font-medium text-gray-900">{label}</label>
    <Select
      options={options}
      onChange={(selected) => onChange(selected?.value || "")}
      value={options.find((option) => option.value === value) || null}
      styles={customStyles}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default SelectInput;
