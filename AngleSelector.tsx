import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";

export interface MarketingAngle {
  id: string;
  name: string;
  description: string;
  example: string;
}

export const MARKETING_ANGLES: MarketingAngle[] = [
  {
    id: "pain",
    name: "Pain-Focused",
    description: "Address customer pain points and problems",
    example: "Leaking roof? Storm damage? We fix it fast!",
  },
  {
    id: "authority",
    name: "Authority-Focused",
    description: "Emphasize experience, credentials, and trust",
    example: "20+ Years Experience • Licensed & Insured • 5-Star Rated",
  },
  {
    id: "value",
    name: "Value-Focused",
    description: "Highlight competitive pricing and offers",
    example: "Best Prices in SLO • Free Estimates • 0% Financing Available",
  },
];

interface AngleSelectorProps {
  selectedAngle: string | null;
  onAngleSelect: (angleId: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

export function AngleSelector({
  selectedAngle,
  onAngleSelect,
  onNext,
  disabled = false,
}: AngleSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 1: Select Marketing Angle</CardTitle>
        <CardDescription>
          Choose the strategic approach for your campaign. This will guide the tone and messaging of your ad copy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedAngle || ""}
          onValueChange={onAngleSelect}
          disabled={disabled}
          className="space-y-4"
        >
          {MARKETING_ANGLES.map((angle) => (
            <div
              key={angle.id}
              className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                selectedAngle === angle.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={angle.id} id={angle.id} className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={angle.id}
                  className="text-base font-semibold cursor-pointer"
                >
                  {angle.name}
                </Label>
                <p className="text-sm text-muted-foreground">{angle.description}</p>
                <p className="text-sm italic text-muted-foreground/80">
                  Example: "{angle.example}"
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={!selectedAngle || disabled}
            size="lg"
          >
            Generate Copy for This Angle →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
