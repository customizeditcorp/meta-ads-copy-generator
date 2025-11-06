import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, ExternalLink, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GeneratedImage {
  id: number;
  format: string;
  url: string;
}

interface ImagePreviewProps {
  images: GeneratedImage[];
  onDownloadAll: () => void;
  onBack: () => void;
  onNewGeneration: () => void;
  downloading?: boolean;
}

const FORMAT_INFO: Record<
  string,
  { label: string; dimensions: string; aspectRatio: string }
> = {
  stories_9x16: {
    label: "Stories",
    dimensions: "1080 × 1920",
    aspectRatio: "9:16",
  },
  feed_4x5: {
    label: "Feed",
    dimensions: "1080 × 1350",
    aspectRatio: "4:5",
  },
  feed_1x1: {
    label: "Feed Square",
    dimensions: "1080 × 1080",
    aspectRatio: "1:1",
  },
};

export function ImagePreview({
  images,
  onDownloadAll,
  onBack,
  onNewGeneration,
  downloading = false,
}: ImagePreviewProps) {
  const handleDownloadSingle = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${FORMAT_INFO[image.format]?.label || image.format}_${image.id}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  if (images.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Images Generated</CardTitle>
          <CardDescription>
            All image generations failed. Please try again or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline">
            ← Back to Photo Selection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>✅ Images Generated Successfully!</CardTitle>
        <CardDescription>
          Your images are ready. Download them individually or all at once as a ZIP file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((image) => {
            const formatInfo = FORMAT_INFO[image.format] || {
              label: image.format,
              dimensions: "Unknown",
              aspectRatio: "Unknown",
            };

            return (
              <div
                key={image.id}
                className="space-y-3 p-4 rounded-lg border bg-card"
              >
                {/* Image Preview */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={`${formatInfo.label} ${formatInfo.aspectRatio}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Format Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">{formatInfo.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatInfo.dimensions} • {formatInfo.aspectRatio}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDownloadSingle(image)}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleOpenInNewTab(image.url)}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Download All Button */}
        <div className="flex flex-col items-center gap-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center">
            <h3 className="font-semibold text-lg">Download All Images</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get all {images.length} images in a single ZIP file
            </p>
          </div>
          <Button
            onClick={onDownloadAll}
            size="lg"
            disabled={downloading}
            className="min-w-[200px]"
          >
            {downloading ? (
              <>
                <Package className="h-4 w-4 mr-2 animate-pulse" />
                Preparing ZIP...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Download All as ZIP
              </>
            )}
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button onClick={onBack} variant="outline">
            ← Back to Photo Selection
          </Button>
          <Button onClick={onNewGeneration} variant="default">
            Generate New Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
