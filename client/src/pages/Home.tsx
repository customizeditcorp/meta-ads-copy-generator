import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Database, FileText, Sparkles, History } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
              <h1 className="text-xl font-bold">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Iniciar Sesión</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container max-w-4xl px-4 py-16 text-center">
            <div className="mb-8">
              <Sparkles className="h-16 w-16 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-4xl font-bold mb-4">Generador de Copy para Meta Ads</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Genera textos publicitarios optimizados para Facebook e Instagram usando IA entrenada con la información de tu cliente.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <Database className="h-8 w-8 mb-2 text-indigo-600" />
                  <CardTitle className="text-lg">Base de Conocimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Crea perfiles detallados de tus clientes con información sobre productos, audiencia y tono de voz.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 mb-2 text-indigo-600" />
                  <CardTitle className="text-lg">Generación con IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Genera múltiples variaciones de copy optimizado usando frameworks probados como AIDA y PAS.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 mb-2 text-indigo-600" />
                  <CardTitle className="text-lg">Listo para Copiar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Textos formateados con límites de caracteres correctos, listos para pegar en Meta Ads Manager.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Comenzar Gratis</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
            <p className="text-muted-foreground">Gestiona tus bases de conocimiento y genera campañas publicitarias</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/knowledge-bases">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Database className="h-10 w-10 mb-3 text-indigo-600" />
                  <CardTitle>Bases de Conocimiento</CardTitle>
                  <CardDescription>
                    Gestiona la información de tus clientes
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/generate">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Sparkles className="h-10 w-10 mb-3 text-indigo-600" />
                  <CardTitle>Generar Campaña</CardTitle>
                  <CardDescription>
                    Crea nuevos textos publicitarios con IA
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <History className="h-10 w-10 mb-3 text-indigo-600" />
                  <CardTitle>Historial</CardTitle>
                  <CardDescription>
                    Revisa campañas generadas anteriormente
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/knowledge-bases/new">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2">
                <CardHeader>
                  <div className="h-10 w-10 mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-2xl text-indigo-600">+</span>
                  </div>
                  <CardTitle>Nueva Base</CardTitle>
                  <CardDescription>
                    Crear nueva base de conocimiento
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
