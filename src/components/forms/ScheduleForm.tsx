"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleFormSchema } from "@/schema/schedule";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { Fragment, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "@/server/actions/schedule";
import _ from "lodash";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const [successMessage, setSuccessMessage] = useState<string>();

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    }
  }, [successMessage]);

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities.toSorted((a, b) => {
        return timeToInt(a.startTime) - timeToInt(b.startTime);
      }),
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  // Original Implementation
  // const groupedAvailabilityFields = Object.groupBy(
  //   availabilityFields.map((field, index) => ({ ...field, index })),
  //   (availability) => availability.dayOfWeek
  // );

  // v1 Implementation
  // const groupedAvailabilityFields = _.groupBy(
  //   availabilityFields.map((field, index) => ({ ...field, index })),
  //   "dayOfWeek"
  // );

  // v2 Implementation
  const groupedAvailabilityFields = _.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.dayOfWeek
  );

  // v3 Implementation
  // const groupedAvailabilityFields = availabilityFields
  //   .map((field, index) => ({ ...field, index }))
  //   .reduce((acc, availability) => {
  //     const key = availability.dayOfWeek;
  //     if (!acc[key]) {
  //       acc[key] = [];
  //     }
  //     acc[key].push(availability);
  //     return acc;
  //   }, {});

  // v4 Implementation
  // const groupBy = (array: T[], key: (item: T) => string) =>
  //   array.reduce((result: Record<string, T[]>, currentValue: T) => {
  //     const groupKey = key(currentValue);
  //     if (!result[groupKey]) {
  //       result[groupKey] = [];
  //     }
  //     result[groupKey].push(currentValue);
  //     return result;
  //   }, {});

  // const groupedAvailabilityFields = groupBy(
  //   schedule.availabilities,
  //   (availability) => availability.dayOfWeek
  // );

  // v5 Implementation
  // const groupBy = (array: T[], key: (item: T) => string) =>
  //   array.reduce((result: Record<string, T[]>, currentValue: T) => {
  //     const groupKey = key(currentValue);
  //     if (!result[groupKey]) {
  //       result[groupKey] = [];
  //     }
  //     result[groupKey].push(currentValue);
  //     return result;
  //   }, {} as Record<string, T[]>);

  // const groupedAvailabilityFields = groupBy(
  //   schedule.availabilities,
  //   (availability) => availability.dayOfWeek
  // );

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const data = await saveSchedule(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved!");
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm">{successMessage}</div>
        )}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Zone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                      {` (${formatTimezoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4">
          {DAYS_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
            <Fragment key={dayOfWeek}>
              <div className="capitalize text-sm font-semibold">
                {dayOfWeek.substring(0, 3)}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="size-6 p-1"
                  variant={"outline"}
                  onClick={() => {
                    addAvailability({
                      dayOfWeek,
                      startTime: "9:00",
                      endTime: "17:00",
                    });
                  }}
                >
                  <Plus className="size-full" />
                </Button>
                {groupedAvailabilityFields[dayOfWeek]?.map(
                  (field, labelIndex) => (
                    <div className="flex flex-col gap-1" key={field.id}>
                      <div
                        key={labelIndex}
                        className="flex gap-2 items-center "
                      >
                        <FormField
                          control={form.control}
                          name={`availabilities.${field.index}.startTime`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${dayOfWeek} Start Time ${
                                    labelIndex + 1
                                  }`}
                                  {...formField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        -
                        <FormField
                          key={labelIndex}
                          control={form.control}
                          name={`availabilities.${field.index}.endTime`}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  className="w-24"
                                  aria-label={`${dayOfWeek} End Time ${
                                    labelIndex + 1
                                  }`}
                                  {...formField}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          className="size-6 p-1"
                          variant={"destructiveGhost"}
                          onClick={() => {
                            removeAvailability(field.index);
                          }}
                        >
                          <X />
                        </Button>
                      </div>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.root?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.startTime?.message
                        }
                      </FormMessage>
                      <FormMessage>
                        {
                          form.formState.errors.availabilities?.at?.(
                            field.index
                          )?.endTime?.message
                        }
                      </FormMessage>
                    </div>
                  )
                )}
              </div>
            </Fragment>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            disabled={
              form.formState.isSubmitting || form.formState.isValidating
            }
            type="submit"
          >
            {form.formState.isSubmitting || form.formState.isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving..
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
