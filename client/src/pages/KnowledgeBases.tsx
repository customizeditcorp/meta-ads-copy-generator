import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function KnowledgeBases() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: knowledgeBases, isLoading } = trpc.knowledgeBase.list.useQuery();
  const deleteMutation = trpc.knowledgeBase.delete.useMutation({
    onSuccess: () => {
      utils.knowledgeBase.list.invalidate();
      toast.success("Base de conocimiento eliminada");
    },
    onError: (error) => {
      toast.error("Error al eliminar: " + error.message);
    }
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bases de Conocimiento</h2>
              <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
            </div>
            <Link href="/knowledge-bases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Base
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Cargando...</p>
            </div>
          ) : knowledgeBases && knowledgeBases.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBases.map((kb) => (
                <Card key={kb.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="flex-1">{kb.name}</span>
                    </CardTitle>
                    {kb.businessName && (
                      <CardDescription>{kb.businessName}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {kb.industry && <p>Industria: {kb.industry}</p>}
                      <p className="text-xs">
                        Creado: {new Date(kb.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/knowledge-bases/${kb.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(kb.id, kb.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No tienes bases de conocimiento creadas aún
                </p>
                <Link href="/knowledge-bases/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Base
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
