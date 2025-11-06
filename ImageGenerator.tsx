import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { AngleSelector, MARKETING_ANGLES } from "@/components/AngleSelector";
import { PhotoSelector, ClientPhoto } from "@/components/PhotoSelector";
import {
  ImageGenerationStatus,
  ImageGenerationStep,
} from "@/components/ImageGenerationStatus";
import { ImagePreview, GeneratedImage } from "@/components/ImagePreview";

type Step = "angle" | "photo" | "generating" | "preview";

export default function ImageGenerator() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Extract campaignId from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const campaignIdParam = searchParams.get("campaignId");
  const campaignId = campaignIdParam ? parseInt(campaignIdParam) : null;

  // State
  const [currentStep, setCurrentStep] = useState<Step>("angle");
  const [selectedAngle, setSelectedAngle] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [clientKnowledgeBaseId, setClientKnowledgeBaseId] = useState<number | null>(null);
  const [generationSteps, setGenerationSteps] = useState<ImageGenerationStep[]>([
    { format: "stories_9x16", status: "pending" },
    { format: "feed_4x5", status: "pending" },
    { format: "feed_1x1", status: "pending" },
  ]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // tRPC Queries
  const { data: campaign } = trpc.campaign.getById.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: photosData, isLoading: loadingPhotos } = trpc.photos.listClientPhotos.useQuery(
    { clientKnowledgeBaseId: clientKnowledgeBaseId! },
    { enabled: !!clientKnowledgeBaseId }
  );

  const generateImagesMutation = trpc.bannerbear.generateImages.useMutation({
    onSuccess: (data) => {
      setGeneratedImages(data.images);
      setCurrentStep("preview");
      toast.success("¡Imágenes generadas exitosamente!");
    },
    onError: (error) => {
      toast.error("Error al generar imágenes: " + error.message);
      setCurrentStep("photo");
    },
  });

  // Extract clientKnowledgeBaseId from campaign
  useEffect(() => {
    if (campaign) {
      setClientKnowledgeBaseId(campaign.clientKnowledgeBaseId);
    }
  }, [campaign]);

  // Timer for generation
  useEffect(() => {
    if (currentStep === "generating" && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep, startTime]);

  // Handlers
  const handleAngleSelect = (angleId: string) => {
    setSelectedAngle(angleId);
  };

  const handleAngleNext = () => {
    if (!selectedAngle) return;
    setCurrentStep("photo");
  };

  const handlePhotoSelect = (photoId: number) => {
    setSelectedPhotoId(photoId);
    const photo = photosData?.photos.find((p) => p.id === photoId);
    if (photo) {
      setSelectedPhotoUrl(photo.url);
    }
  };

  const handlePhotoNext = () => {
    if (!selectedPhotoId || !selectedPhotoUrl || !campaignId || !clientKnowledgeBaseId) {
      toast.error("Por favor selecciona una foto");
      return;
    }

    // Get copy from campaign (use first angle's first variation for simplicity)
    const campaignContent = campaign?.generatedContent
      ? JSON.parse(campaign.generatedContent)
      : null;

    if (!campaignContent || !campaignContent.campaign_suggestions?.[0]) {
      toast.error("No se encontró contenido de campaña");
      return;
    }

    const firstAngle = campaignContent.campaign_suggestions[0];
    const headline = firstAngle.headlines?.[0]?.copy || "Get Your Free Estimate";
    const description = firstAngle.descriptions?.[0]?.copy || "Licensed & Insured";
    const cta = firstAngle.lead_form?.cta_button_text || "Book Free Estimate";

    setCurrentStep("generating");
    setStartTime(Date.now());
    setElapsedTime(0);

    // Simulate step updates (Bannerbear API will handle actual generation)
    setGenerationSteps([
      { format: "stories_9x16", status: "generating" },
      { format: "feed_4x5", status: "pending" },
      { format: "feed_1x1", status: "pending" },
    ]);

    setTimeout(() => {
      setGenerationSteps([
        { format: "stories_9x16", status: "completed" },
        { format: "feed_4x5", status: "generating" },
        { format: "feed_1x1", status: "pending" },
      ]);
    }, 1000);

    setTimeout(() => {
      setGenerationSteps([
        { format: "stories_9x16", status: "completed" },
        { format: "feed_4x5", status: "completed" },
        { format: "feed_1x1", status: "generating" },
      ]);
    }, 2000);

    // Trigger actual generation
    generateImagesMutation.mutate({
      campaignId,
      headline,
      description,
      cta,
      photoUrl: selectedPhotoUrl,
      clientKnowledgeBaseId,
      selectedPhotoId,
      selectedAngle: selectedAngle || undefined,
    });
  };

  const handlePhotoBack = () => {
    setCurrentStep("angle");
  };

  const handleDownloadAll = async () => {
    toast.info("Descargando todas las imágenes...");
    // Download each image individually (ZIP generation would require backend support)
    generatedImages.forEach((image, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = image.url;
        link.download = `${image.format}_${image.id}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });
  };

  const handlePreviewBack = () => {
    setCurrentStep("photo");
  };

  const handleNewGeneration = () => {
    setSelectedAngle(null);
    setSelectedPhotoId(null);
    setSelectedPhotoUrl(null);
    setGeneratedImages([]);
    setGenerationSteps([
      { format: "stories_9x16", status: "pending" },
      { format: "feed_4x5", status: "pending" },
      { format: "feed_1x1", status: "pending" },
    ]);
    setCurrentStep("angle");
  };

  // Validation
  if (!campaignId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Campaign Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a campaign from the campaign history page.
          </p>
          <Link href="/campaigns">
            <Button>Go to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/campaigns">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-xl font-bold">Image Generator</h1>
          </div>
          <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Generate Campaign Images</h2>
            <p className="text-muted-foreground">
              Create professional Meta Ads images in 3 formats using Bannerbear
            </p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {["angle", "photo", "generating", "preview"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : index <
                        ["angle", "photo", "generating", "preview"].indexOf(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 h-0.5 ${
                      index <
                      ["angle", "photo", "generating", "preview"].indexOf(currentStep)
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === "angle" && (
            <AngleSelector
              selectedAngle={selectedAngle}
              onAngleSelect={handleAngleSelect}
              onNext={handleAngleNext}
            />
          )}

          {currentStep === "photo" && (
            <PhotoSelector
              photos={photosData?.photos || []}
              selectedPhotoId={selectedPhotoId}
              onPhotoSelect={handlePhotoSelect}
              onNext={handlePhotoNext}
              onBack={handlePhotoBack}
              loading={loadingPhotos}
            />
          )}

          {currentStep === "generating" && (
            <ImageGenerationStatus
              steps={generationSteps}
              currentStep={generationSteps.filter((s) => s.status === "completed").length}
              totalSteps={3}
              elapsedTime={elapsedTime}
            />
          )}

          {currentStep === "preview" && (
            <ImagePreview
              images={generatedImages}
              onDownloadAll={handleDownloadAll}
              onBack={handlePreviewBack}
              onNewGeneration={handleNewGeneration}
            />
          )}
        </div>
      </main>
    </div>
  );
}
