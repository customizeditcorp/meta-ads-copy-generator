import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentImporterProps {
  onExtracted: (data: {
    name: string;
    businessName: string;
    website: string;
    businessDescription: string;
    industry: string;
    products: string;
    targetDemographics: string;
    targetPsychographics: string;
    painPoints: string;
    desires: string;
    toneAdjectives: string;
    toneExamples: string;
    antiToneExamples: string;
    formalityLevel: string;
    usp: string;
    differentiators: string;
  }) => void;
}

export default function DocumentImporter({ onExtracted }: DocumentImporterProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const extractMutation = trpc.knowledgeBase.extractFromDocuments.useMutation({
    onSuccess: (data) => {
      toast.success("Información extraída exitosamente");
      onExtracted(data);
      setFiles([]);
    },
    onError: (error) => {
      toast.error("Error al extraer: " + error.message);
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (files.length === 0) {
      toast.error("Por favor sube al menos un documento");
      return;
    }

    setIsUploading(true);

    try {
      // Upload files to server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await fetch("/api/upload/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir archivos");
      }

      const { documentsText } = await response.json();

      // Extract knowledge using GPT
      extractMutation.mutate({ documentsText });
    } catch (error) {
      toast.error("Error al procesar documentos");
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar desde Documentos
        </CardTitle>
        <CardDescription>
          Sube tus documentos de GPTs (Word o TXT) y la IA extraerá automáticamente toda la
          información para rellenar la base de conocimiento. Soporta: .docx, .doc, .txt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            id="document-upload"
            multiple
            accept=".docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="document-upload">
            <Button type="button" variant="outline" className="w-full" asChild>
              <span>
                <FileText className="h-4 w-4 mr-2" />
                Seleccionar Archivos
              </span>
            </Button>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Archivos seleccionados:</p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          onClick={handleExtract}
          disabled={files.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading || extractMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Extraer Información
            </>
          )}
        </Button>

        {isUploading && !extractMutation.isPending && (
          <p className="text-sm text-muted-foreground text-center">
            Subiendo archivos...
          </p>
        )}

        {extractMutation.isPending && (
          <p className="text-sm text-muted-foreground text-center">
            Analizando documentos con IA... Esto puede tomar 10-30 segundos
          </p>
        )}
      </CardContent>
    </Card>
  );
}
