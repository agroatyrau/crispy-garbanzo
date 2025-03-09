import { useQuery } from "@tanstack/react-query";
import { Task, Submission, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

type LeaderboardEntry = {
  username: string;
  totalPoints: number;
  submissions: number;
};

export default function Leaderboard() {
  const { data: submissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const leaderboard: LeaderboardEntry[] = [];
  if (submissions && tasks) {
    const userStats = new Map<number, LeaderboardEntry>();

    submissions.forEach((submission) => {
      const task = tasks.find((t) => t.id === submission.taskId);
      if (!task) return;

      const stats = userStats.get(submission.userId) || {
        username: `Участник ${submission.userId}`,
        totalPoints: 0,
        submissions: 0,
      };

      if (submission.status === "accepted") {
        stats.totalPoints += task.points;
      }
      stats.submissions += 1;

      userStats.set(submission.userId, stats);
    });

    leaderboard.push(...Array.from(userStats.values()));
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold ml-2">Таблица лидеров</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Рейтинг участников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-medium">{index + 1}</span>
                    <span>{entry.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{entry.totalPoints} баллов</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.submissions} решений
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
