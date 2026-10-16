"use client";

import {
  Calendar,
  DateField,
  DatePicker,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";

type DatePickerFieldProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxValue?: string;
  minValue?: string;
};

export default function DatePickerField({
  name,
  value,
  onChange,
  required = false,
  maxValue,
  minValue,
}: DatePickerFieldProps) {
  return (
    <div className="w-full">
      <DatePicker
        aria-label={name}
        value={value ? parseDate(value) : null}
        onChange={(date) => onChange(date?.toString() ?? "")}
        isRequired={required}
        maxValue={maxValue ? parseDate(maxValue) : undefined}
        minValue={minValue ? parseDate(minValue) : undefined}
        className="w-full"
      >
        <DateField.Group className="flex h-11 w-full items-center rounded-xl border border-border bg-background px-3">
          <DateField.Input>
            {(segment) => (
              <DateField.Segment segment={segment} />
            )}
          </DateField.Input>

          <DateField.Suffix>
            <DatePicker.Trigger className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground">
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>

        <DatePicker.Popover>
          <Calendar aria-label="Choose date">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>

              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>

            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => (
                  <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                )}
              </Calendar.GridHeader>

              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}