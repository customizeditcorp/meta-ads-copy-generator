import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle2, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClientPhoto {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl?: string | null;
  description?: string | null;
  category?: string | null;
}

interface PhotoSelectorProps {
  photos: ClientPhoto[];
  selectedPhotoId: number | null;
  onPhotoSelect: (photoId: number) => void;
  onNext: () => void;
  onBack: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PhotoSelector({
  photos,
  selectedPhotoId,
  onPhotoSelect,
  onNext,
  onBack,
  disabled = false,
  loading = false,
}: PhotoSelectorProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (photoId: number) => {
    setImageErrors((prev) => new Set(prev).add(photoId));
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Step 2: Select Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading photos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Step 2: Select Photo</CardTitle>
          <CardDescription>
            No photos available for this client. Please upload photos first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-muted-foreground">
            <ImageIcon className="h-16 w-16" />
            <p className="text-sm">No photos found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 2: Select Photo</CardTitle>
        <CardDescription>
          Choose the background image for your ad. This will be used in all 3 formats (Stories, Feed 4:5, Feed 1:1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isSelected = selectedPhotoId === photo.id;
            const hasError = imageErrors.has(photo.id);

            return (
              <button
                key={photo.id}
                onClick={() => onPhotoSelect(photo.id)}
                disabled={disabled || hasError}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  "hover:scale-105 hover:shadow-lg",
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-border hover:border-primary/50",
                  disabled && "opacity-50 cursor-not-allowed",
                  hasError && "opacity-30 cursor-not-allowed"
                )}
              >
                {/* Image */}
                {!hasError ? (
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.description || photo.filename}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(photo.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-primary drop-shadow-lg" />
                  </div>
                )}

                {/* Description Overlay */}
                {photo.description && !hasError && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                    {photo.description}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Photo Info */}
        {selectedPhotoId && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">Selected Photo:</p>
            <p className="text-sm text-muted-foreground">
              {photos.find((p) => p.id === selectedPhotoId)?.description ||
                photos.find((p) => p.id === selectedPhotoId)?.filename}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" disabled={disabled}>
            ← Back to Angle Selection
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedPhotoId || disabled}
            size="lg"
          >
            Generate Images →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
