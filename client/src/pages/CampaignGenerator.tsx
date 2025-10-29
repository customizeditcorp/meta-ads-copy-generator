import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type CopyItem = { copy: string; char_count: number };
type CampaignAngle = { angle: string; primary_texts: CopyItem[]; headlines: CopyItem[]; descriptions: CopyItem[]; };

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
                    <Label htmlFor="objective">Objetivo de Campaña *</Label>
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
                  <div><Label htmlFor="product">Producto/Servicio Enfocado</Label><Input id="product" value={productFocus} onChange={(e) => setProductFocus(e.target.value)} placeholder="Ej: Curso de Marketing Digital" /></div>
                  <div><Label htmlFor="offer">Oferta Específica</Label><Textarea id="offer" value={offerDetails} onChange={(e) => setOfferDetails(e.target.value)} placeholder="Ej: 20% de descuento en el primer mes" rows={3} /></div>
                  <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="w-full">
                    {generateMutation.isPending ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Generando...</>) : (<><Sparkles className="h-4 w-4 mr-2" />Generar Campaña</>)}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              {!generatedContent ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Configura los parámetros y genera tu primera campaña</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {generatedContent.map((angle, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">Ángulo {idx + 1}</span>
                          {angle.angle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Textos Principales</h4>
                          <div className="space-y-2">
                            {angle.primary_texts.map((item, i) => (
                              <div key={i} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="flex-1 text-sm">{item.copy}</p>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.copy)}><Copy className="h-4 w-4" /></Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{item.char_count} caracteres{item.char_count > 125 && (<span className="text-orange-600 ml-2">⚠ Excede recomendación (125)</span>)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Títulos</h4>
                          <div className="space-y-2">
                            {angle.headlines.map((item, i) => (
                              <div key={i} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="flex-1 text-sm font-medium">{item.copy}</p>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.copy)}><Copy className="h-4 w-4" /></Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{item.char_count} caracteres{item.char_count > 40 && (<span className="text-orange-600 ml-2">⚠ Excede recomendación (40)</span>)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {angle.descriptions.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Descripciones</h4>
                            <div className="space-y-2">
                              {angle.descriptions.map((item, i) => (
                                <div key={i} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="flex-1 text-sm">{item.copy}</p>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.copy)}><Copy className="h-4 w-4" /></Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">{item.char_count} caracteres{item.char_count > 30 && (<span className="text-orange-600 ml-2">⚠ Excede recomendación (30)</span>)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
