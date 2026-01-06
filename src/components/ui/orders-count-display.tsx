import React, { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { pl } from "@/lib/translations";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrdersCountDisplayProps {
  count: number;
  totalCount: number;
  className?: string;
  onResetFilters?: () => void;
}

export function BackToDeliveriesLink() {
  return (
    <Link
      to="/delivery_routes"
      className="inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium px-3 py-2 rounded shadow-md transition-colors"
      title={pl.backToDeliveries}
    >
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      {pl.backToDeliveries}
    </Link>
  );
}

const OrdersCountDisplay: React.FC<OrdersCountDisplayProps> = ({
  count,
  totalCount,
  className = "",
  onResetFilters,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    onResetFilters?.();
    setShowResetDialog(false);
  };

  if (onResetFilters) {
    return (
      <>
        <Button
          onClick={() => setShowResetDialog(true)}
          className="text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium px-3 py-2 rounded shadow-md transition-colors inline-flex items-center gap-1 h-auto"
          size="sm"
          variant="default"
        >
          Zamówienia: {count} / {totalCount}
        </Button>

        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>Reset Filters?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all filters? This will restore
              default filter settings.
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                Reset Filters
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`text-sm font-medium gap-1 ${className}`}
    >
      <span>
        {pl.totalOrders}: {count}
      </span>
    </Badge>
  );
};

export default OrdersCountDisplay;
