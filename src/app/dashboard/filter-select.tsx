type Option = { value: string; label: string };

type Props = {
  id: string;
  label: string;
  value: string;
  /** undefined while the choices load; the current value stays selectable meanwhile. */
  options: Option[] | undefined;
  onChange: (value: string) => void;
  /** Text of the "no filter" choice; omit to make a choice mandatory. */
  allLabel?: string;
};

export const labelClass = "block text-xs font-bold text-accent";

export default function FilterSelect({ id, label, value, options, onChange, allLabel = "すべて" }: Props) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
      >
        {allLabel && <option value="">{allLabel}</option>}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : value && <option value={value}>…</option>}
      </select>
    </div>
  );
}
