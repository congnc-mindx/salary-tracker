import SelectField from "./SelectField";

export default function TimeSelect({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Chọn giờ bắt đầu",
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? {
          value: option,
          label: option,
        }
      : option,
  );

  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={normalizedOptions}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
