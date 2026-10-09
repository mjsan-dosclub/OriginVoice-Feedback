import { cn } from "@/lib/utils";

export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
}: {
  legend: string;
  name: string;
  value: T | "";
  onChange: (value: T) => void;
  options: { value: T; title: string; detail?: string }[];
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 ring-1",
              selected ? "bg-accent text-accent-fg ring-accent" : "bg-surface text-fg ring-border",
            )}
          >
            <span>
              <span className="block text-sm font-medium">{option.title}</span>
              {option.detail ? (
                <span className={cn("block text-sm", selected ? "text-accent-fg/75" : "text-muted")}>
                  {option.detail}
                </span>
              ) : null}
            </span>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="size-4"
            />
          </label>
        );
      })}
    </fieldset>
  );
}
