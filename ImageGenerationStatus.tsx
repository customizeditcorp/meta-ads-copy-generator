import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageGenerationStep {
  format: string;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
}

interface ImageGenerationStatusProps {
  steps: ImageGenerationStep[];
  currentStep: number;
  totalSteps: number;
  elapsedTime: number;
}

const FORMAT_LABELS: Record<string, string> = {
  stories_9x16: "Stories (9:16)",
  feed_4x5: "Feed (4:5)",
  feed_1x1: "Feed (1:1)",
};

export function ImageGenerationStatus({
  steps,
  currentStep,
  totalSteps,
  elapsedTime,
}: ImageGenerationStatusProps) {
  const progress = (currentStep / totalSteps) * 100;
  const isComplete = currentStep === totalSteps;
  const hasErrors = steps.some((step) => step.status === "failed");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isComplete
            ? hasErrors
              ? "Generation Completed with Errors"
              : "Images Generated Successfully!"
            : "Generating Images..."}
        </CardTitle>
        <CardDescription>
          {isComplete
            ? `All images processed in ${elapsedTime}s`
            : `Please wait while we generate your images. This may take up to 90 seconds.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Progress: {currentStep}/{totalSteps} images
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {elapsedTime}s
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Details */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.status === "generating";
            const isCompleted = step.status === "completed";
            const isFailed = step.status === "failed";
            const isPending = step.status === "pending";

            return (
              <div
                key={step.format}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  isActive && "border-primary bg-primary/5",
                  isCompleted && "border-green-500/50 bg-green-500/5",
                  isFailed && "border-red-500/50 bg-red-500/5",
                  isPending && "border-border bg-muted/30"
                )}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isActive && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
                  {isPending && (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {FORMAT_LABELS[step.format] || step.format}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isActive && "Calling Bannerbear API..."}
                    {isCompleted && "Ready!"}
                    {isFailed && (step.error || "Generation failed")}
                    {isPending && "Waiting..."}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      ✓ Done
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                      ✗ Failed
                    </span>
                  )}
                  {isActive && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      ⏳ Generating
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Message */}
        {isComplete && (
          <div
            className={cn(
              "p-4 rounded-lg border",
              hasErrors
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-green-50 border-green-200 text-green-800"
            )}
          >
            <p className="text-sm font-medium">
              {hasErrors
                ? `${steps.filter((s) => s.status === "completed").length} of ${totalSteps} images generated successfully`
                : `All ${totalSteps} images generated successfully!`}
            </p>
            {hasErrors && (
              <p className="text-xs mt-1">
                Some images failed to generate. You can still download the successful ones.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
