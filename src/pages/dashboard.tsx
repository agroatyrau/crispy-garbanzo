import { useQuery } from "@tanstack/react-query";
import { Task, Submission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  async function handleSubmit(taskId: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("taskId", taskId.toString());
    formData.append("code", file);

    try {
      await fetch("/api/submit", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      toast({
        title: "Успешно",
        description: "Решение отправлено на проверку",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить решение",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Конкурс программирования</h1>
          <div className="flex items-center gap-4">
            <span>{user?.username}</span>
            <Link href="/leaderboard">
              <Button variant="outline">Таблица лидеров</Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {tasks?.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{task.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {task.points} баллов
                  </span>
                  <Button
                    disabled={submitting}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".cpp,.py,.java";
                      input.onchange = (e) =>
                        handleSubmit(task.id, e as any);
                      input.click();
                    }}
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Отправить решение
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
