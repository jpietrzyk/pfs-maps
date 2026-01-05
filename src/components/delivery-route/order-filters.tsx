import React, { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import {
  ChevronDown,
  AlertCircle,
  Zap,
  Clock,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";

export type PriorityFilterState = {
  low: boolean;
  medium: boolean;
  high: boolean;
};

export type StatusFilterState = {
  pending: boolean;
  "in-progress": boolean;
  completed: boolean;
  cancelled: boolean;
};

interface OrderFiltersProps {
  onPriorityChange: (filters: PriorityFilterState) => void;
  onStatusChange?: (filters: StatusFilterState) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  onPriorityChange,
  onStatusChange,
}) => {
  const [priorities, setPriorities] = useState<PriorityFilterState>({
    low: true,
    medium: true,
    high: true,
  });

  const [statuses, setStatuses] = useState<StatusFilterState>({
    pending: true,
    "in-progress": true,
    completed: true,
    cancelled: true,
  });

  const handlePriorityChange = (priority: keyof PriorityFilterState) => {
    const newFilters = { ...priorities, [priority]: !priorities[priority] };
    setPriorities(newFilters);
    onPriorityChange(newFilters);
  };

  const handleStatusChange = (status: keyof StatusFilterState) => {
    const newFilters = { ...statuses, [status]: !statuses[status] };
    setStatuses(newFilters);
    onStatusChange?.(newFilters);
  };

  return (
    <div className="w-full px-6 py-4 border-b border-border bg-muted/50">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Priority</p>
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={priorities.low}
              onPressedChange={() => handlePriorityChange("low")}
              size="sm"
              aria-label="Filter by Low priority"
              className="data-[state=on]:text-green-600 data-[state=on]:*:[svg]:stroke-green-600"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Low
            </Toggle>

            <Toggle
              pressed={priorities.medium}
              onPressedChange={() => handlePriorityChange("medium")}
              size="sm"
              aria-label="Filter by Medium priority"
              className="data-[state=on]:text-yellow-600 data-[state=on]:*:[svg]:stroke-yellow-600"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Medium
            </Toggle>

            <Toggle
              pressed={priorities.high}
              onPressedChange={() => handlePriorityChange("high")}
              size="sm"
              aria-label="Filter by High priority"
              className="data-[state=on]:text-red-600 data-[state=on]:*:[svg]:stroke-red-600"
            >
              <Zap className="h-4 w-4 mr-1" />
              High
            </Toggle>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground/70">Status</p>
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={statuses.pending}
              onPressedChange={() => handleStatusChange("pending")}
              size="sm"
              aria-label="Filter by Pending status"
              className="data-[state=on]:text-blue-600 data-[state=on]:*:[svg]:stroke-blue-600"
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Toggle>

            <Toggle
              pressed={statuses["in-progress"]}
              onPressedChange={() => handleStatusChange("in-progress")}
              size="sm"
              aria-label="Filter by In Progress status"
              className="data-[state=on]:text-purple-600 data-[state=on]:*:[svg]:stroke-purple-600"
            >
              <Play className="h-4 w-4 mr-1" />
              In Progress
            </Toggle>

            <Toggle
              pressed={statuses.completed}
              onPressedChange={() => handleStatusChange("completed")}
              size="sm"
              aria-label="Filter by Completed status"
              className="data-[state=on]:text-emerald-600 data-[state=on]:*:[svg]:stroke-emerald-600"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Toggle>

            <Toggle
              pressed={statuses.cancelled}
              onPressedChange={() => handleStatusChange("cancelled")}
              size="sm"
              aria-label="Filter by Cancelled status"
              className="data-[state=on]:text-gray-600 data-[state=on]:*:[svg]:stroke-gray-600"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelled
            </Toggle>
          </div>
        </div>
      </div>
    </div>
  );
};
