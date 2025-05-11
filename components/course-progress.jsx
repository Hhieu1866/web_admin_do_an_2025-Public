import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

const colorByVariant = {
  default: "text-sky-700",
  success: "text-emerald-700",
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

export const CourseProgress = ({ value = 0, variant, size }) => {
  // Đảm bảo giá trị value luôn hợp lệ
  const safeValue = isNaN(value) || value < 0 ? 0 : value > 100 ? 100 : value;

  return (
    <div>
      <Progress
        value={safeValue}
        variant={variant}
        className={cn("h-2", !variant && "text-sky-700")}
      />
      <p
        className={cn(
          "mt-2 font-medium text-sky-700",
          colorByVariant[variant || "default"],
          sizeByVariant[size || "default"],
        )}
      >
        {Math.round(safeValue)}% Complete
      </p>
    </div>
  );
};
