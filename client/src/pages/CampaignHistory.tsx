import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CampaignHistory() {
  const { user } = useAuth();
  const { data: campaigns, isLoading } = trpc.campaign.list.useQuery();

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
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Historial de Campañas</h2>
            <p className="text-muted-foreground">Revisa las campañas generadas anteriormente</p>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando...</p>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Campaña #{campaign.id}</span>
                      <span className="text-sm font-normal text-muted-foreground">{new Date(campaign.createdAt).toLocaleString()}</span>
                    </CardTitle>
                    <CardDescription>
                      Objetivo: {campaign.campaignObjective} {campaign.productFocus && `• Producto: ${campaign.productFocus}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(JSON.parse(campaign.generatedContent), null, 2)}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">No has generado campañas aún</p>
                <Link href="/generate"><Button>Generar Primera Campaña</Button></Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
