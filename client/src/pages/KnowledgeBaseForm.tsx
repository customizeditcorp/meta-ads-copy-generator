import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useParams } from "wouter";
import DocumentImporter from "@/components/DocumentImporter";

export default function KnowledgeBaseForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const isEdit = !!params.id;
  const kbId = params.id ? parseInt(params.id) : undefined;

  const { data: existingKb, isLoading: loadingKb } = trpc.knowledgeBase.getById.useQuery(
    { id: kbId! },
    { enabled: isEdit && !!kbId }
  );

  const [formData, setFormData] = useState({
    name: "", businessName: "", website: "", businessDescription: "", industry: "",
    products: "", targetDemographics: "", targetPsychographics: "", painPoints: "", desires: "",
    toneAdjectives: "", toneExamples: "", antiToneExamples: "", formalityLevel: "", usp: "", differentiators: "",
    valueProposition: "",
  });

  useEffect(() => {
    if (existingKb) {
      setFormData({
        name: existingKb.name || "", businessName: existingKb.businessName || "",
        website: existingKb.website || "", businessDescription: existingKb.businessDescription || "",
        industry: existingKb.industry || "", products: existingKb.products || "",
        targetDemographics: existingKb.targetDemographics || "", targetPsychographics: existingKb.targetPsychographics || "",
        painPoints: existingKb.painPoints || "", desires: existingKb.desires || "",
        toneAdjectives: existingKb.toneAdjectives || "", toneExamples: existingKb.toneExamples || "",
        antiToneExamples: existingKb.antiToneExamples || "", formalityLevel: existingKb.formalityLevel || "",
        usp: existingKb.usp || "", differentiators: existingKb.differentiators || "",
        valueProposition: existingKb.valueProposition || "",
      });
    }
  }, [existingKb]);

  const createMutation = trpc.knowledgeBase.create.useMutation({
    onSuccess: () => { toast.success("Base de conocimiento creada"); navigate("/knowledge-bases"); },
    onError: (error) => { toast.error("Error al crear: " + error.message); },
  });

  const updateMutation = trpc.knowledgeBase.update.useMutation({
    onSuccess: () => { toast.success("Base de conocimiento actualizada"); navigate("/knowledge-bases"); },
    onError: (error) => { toast.error("Error al actualizar: " + error.message); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && kbId) { updateMutation.mutate({ id: kbId, ...formData }); }
    else { createMutation.mutate(formData); }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isEdit && loadingKb) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/knowledge-bases"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{isEdit ? "Editar" : "Nueva"} Base de Conocimiento</h2>
            <p className="text-muted-foreground">Completa la información del cliente para entrenar el generador de copy</p>
          </div>
          
          {!isEdit && (
            <DocumentImporter
              onExtracted={(data) => {
                setFormData({ ...data });
                toast.success("Formulario rellenado automáticamente. Revisa y ajusta si es necesario.");
              }}
            />
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Información General</CardTitle><CardDescription>Datos básicos del cliente</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="name">Nombre de la Base *</Label><Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Ej: Cliente ABC - Campaña 2025" required /></div>
                <div><Label htmlFor="businessName">Nombre del Negocio</Label><Input id="businessName" value={formData.businessName} onChange={(e) => handleChange("businessName", e.target.value)} placeholder="Ej: Tienda XYZ" /></div>
                <div><Label htmlFor="website">Sitio Web</Label><Input id="website" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://ejemplo.com" /></div>
                <div><Label htmlFor="industry">Industria</Label><Input id="industry" value={formData.industry} onChange={(e) => handleChange("industry", e.target.value)} placeholder="Ej: E-commerce, SaaS, Educación" /></div>
                <div><Label htmlFor="businessDescription">Descripción del Negocio</Label><Textarea id="businessDescription" value={formData.businessDescription} onChange={(e) => handleChange("businessDescription", e.target.value)} placeholder="¿Qué hace la empresa? ¿Cuál es su misión?" rows={4} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Productos/Servicios</CardTitle><CardDescription>Describe los productos o servicios a promocionar</CardDescription></CardHeader>
              <CardContent><Textarea value={formData.products} onChange={(e) => handleChange("products", e.target.value)} placeholder="Producto principal, características clave, beneficios principales..." rows={6} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Público Objetivo</CardTitle><CardDescription>Define a quién va dirigida la campaña</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="targetDemographics">Demografía</Label><Textarea id="targetDemographics" value={formData.targetDemographics} onChange={(e) => handleChange("targetDemographics", e.target.value)} placeholder="Edad, género, ubicación, nivel de ingresos, ocupación..." rows={3} /></div>
                <div><Label htmlFor="targetPsychographics">Psicografía</Label><Textarea id="targetPsychographics" value={formData.targetPsychographics} onChange={(e) => handleChange("targetPsychographics", e.target.value)} placeholder="Intereses, valores, estilo de vida..." rows={3} /></div>
                <div><Label htmlFor="painPoints">Puntos de Dolor</Label><Textarea id="painPoints" value={formData.painPoints} onChange={(e) => handleChange("painPoints", e.target.value)} placeholder="¿Qué problemas o frustraciones enfrenta este público?" rows={3} /></div>
                <div><Label htmlFor="desires">Deseos y Aspiraciones</Label><Textarea id="desires" value={formData.desires} onChange={(e) => handleChange("desires", e.target.value)} placeholder="¿Qué es lo que más desean lograr?" rows={3} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tono de Voz</CardTitle><CardDescription>Define la personalidad de la marca en los anuncios</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="toneAdjectives">Adjetivos del Tono</Label><Input id="toneAdjectives" value={formData.toneAdjectives} onChange={(e) => handleChange("toneAdjectives", e.target.value)} placeholder="Ej: Amigable, Profesional, Divertido, Inspirador" /></div>
                <div><Label htmlFor="formalityLevel">Nivel de Formalidad</Label><Input id="formalityLevel" value={formData.formalityLevel} onChange={(e) => handleChange("formalityLevel", e.target.value)} placeholder="Ej: Muy informal, Conversacional, Profesional, Corporativo" /></div>
                <div><Label htmlFor="toneExamples">Ejemplos de Tono (qué SÍ hacer)</Label><Textarea id="toneExamples" value={formData.toneExamples} onChange={(e) => handleChange("toneExamples", e.target.value)} placeholder='"Nos encanta ayudarte a crecer"' rows={2} /></div>
                <div><Label htmlFor="antiToneExamples">Anti-Tono (qué NO hacer)</Label><Textarea id="antiToneExamples" value={formData.antiToneExamples} onChange={(e) => handleChange("antiToneExamples", e.target.value)} placeholder="Evitar jerga técnica excesiva" rows={2} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Propuesta Única de Valor</CardTitle><CardDescription>¿Qué hace diferente a este negocio?</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="valueProposition">Propuesta de Valor Principal</Label><Textarea id="valueProposition" value={formData.valueProposition} onChange={(e) => handleChange("valueProposition", e.target.value)} placeholder="La promesa central y transformación que ofreces al cliente..." rows={3} /></div>
                <div><Label htmlFor="usp">USP (Unique Selling Proposition)</Label><Textarea id="usp" value={formData.usp} onChange={(e) => handleChange("usp", e.target.value)} placeholder="¿Qué hace que tu oferta sea diferente y mejor que la competencia?" rows={3} /></div>
                <div><Label htmlFor="differentiators">Diferenciadores Clave</Label><Textarea id="differentiators" value={formData.differentiators} onChange={(e) => handleChange("differentiators", e.target.value)} placeholder="Lista los principales diferenciadores..." rows={3} /></div>
              </CardContent>
            </Card>
            <div className="flex gap-4">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                <Save className="h-4 w-4 mr-2" />{isEdit ? "Actualizar" : "Crear"} Base de Conocimiento
              </Button>
              <Link href="/knowledge-bases"><Button type="button" variant="outline">Cancelar</Button></Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}