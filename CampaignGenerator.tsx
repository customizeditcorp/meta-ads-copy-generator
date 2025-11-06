import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type CopyItem = { copy: string; char_count: number };
type LeadFormQuestion = { question: string; options: string[]; };
type LeadForm = { form_headline: string; form_description: string; custom_questions: LeadFormQuestion[]; thank_you_message: string; cta_button_text: string; };
type CampaignAngle = { angle: string; primary_texts: CopyItem[]; headlines: CopyItem[]; descriptions: CopyItem[]; lead_form: LeadForm; };

export default function CampaignGenerator() {
  const { user } = useAuth();
  const { data: knowledgeBases } = trpc.knowledgeBase.list.useQuery();
  const [selectedKbId, setSelectedKbId] = useState<string>("");
  const [campaignObjective, setCampaignObjective] = useState<string>("");
  const [productFocus, setProductFocus] = useState<string>("");
  const [offerDetails, setOfferDetails] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<CampaignAngle[] | null>(null);

  const generateMutation = trpc.campaign.generate.useMutation({
    onSuccess: (data) => { setGeneratedContent(data.content.campaign_suggestions); toast.success("¡Campaña generada exitosamente!"); },
    onError: (error) => { toast.error("Error al generar: " + error.message); },
  });

  const handleGenerate = () => {
    if (!selectedKbId) { toast.error("Por favor selecciona una base de conocimiento"); return; }
    if (!campaignObjective) { toast.error("Por favor selecciona un objetivo de campaña"); return; }
    generateMutation.mutate({ knowledgeBaseId: parseInt(selectedKbId), campaignObjective, productFocus: productFocus || undefined, offerDetails: offerDetails || undefined });
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copiado al portapapeles"); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Generar Campaña</h2>
            <p className="text-muted-foreground">Crea textos publicitarios optimizados para Meta Ads</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader><CardTitle>Parámetros de Generación</CardTitle><CardDescription>Configura tu campaña</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="kb">Base de Conocimiento *</Label>
                    <Select value={selectedKbId} onValueChange={setSelectedKbId}>
                      <SelectTrigger id="kb"><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                      <SelectContent>{knowledgeBases?.map((kb) => (<SelectItem key={kb.id} value={kb.id.toString()}>{kb.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="objective">
                      Objetivo de Campaña *
                      <InfoTooltip content="Define la estrategia del copy. Awareness: generar conocimiento. Traffic/Engagement: atraer interés. Leads: capturar contactos. Sales: cerrar ventas. Cada objetivo usa diferentes técnicas de persuasión." />
                    </Label>
                    <Select value={campaignObjective} onValueChange={setCampaignObjective}>
                      <SelectTrigger id="objective"><SelectValue placeholder="Selecciona un objetivo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Reconocimiento de Marca</SelectItem>
                        <SelectItem value="traffic">Tráfico</SelectItem>
                        <SelectItem value="engagement">Interacción</SelectItem>
                        <SelectItem value="leads">Generación de Leads</SelectItem>
                        <SelectItem value="sales">Ventas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="product">
                      Producto/Servicio Enfocado
                      <InfoTooltip content="Define QUÉ servicio promocionas. Esto determina qué beneficios destacar e influye en el vocabulario del copy. Ejemplo: New Roof Installation, Emergency Leak Repair, Roof & Deck Waterproofing" />
                    </Label>
                    <Input 
                      id="product" 
                      value={productFocus} 
                      onChange={(e) => setProductFocus(e.target.value)} 
                      placeholder="Ej: New Roof Installation, Emergency Leak Repair, Preventive Inspection" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Opcional: Deja vacío para copy general</p>