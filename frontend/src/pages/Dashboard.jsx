import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare, Clock, ListTodo, Bell, TrendingUp, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDateTime, isUrgent, isOverdue } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="border-border/60 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/tasks").then((r) => setTasks(r.data.tasks)),
      api.get("/reminders/upcoming").then((r) => setReminders(r.data.reminders)),
    ]).finally(() => setLoading(false));
  }, []);

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const withReminder = tasks.filter((t) => t.reminder_at).length;

  const recentTasks = [...tasks].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span className="text-primary">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ListTodo}    label="Total Tasks"    value={loading ? "—" : total}     color="bg-primary/10 text-primary" />
        <StatCard icon={CheckSquare} label="Completed"      value={loading ? "—" : completed} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Clock}       label="Pending"        value={loading ? "—" : pending}   color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Bell}        label="Reminders Set"  value={loading ? "—" : withReminder} color="bg-violet-500/10 text-violet-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent tasks */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Recent Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/tasks">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <ListTodo className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">No tasks yet</p>
                <Button variant="ghost" size="sm" asChild className="mt-2">
                  <Link to="/tasks">Create your first task</Link>
                </Button>
              </div>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/20 px-4 py-2.5 transition-colors hover:bg-secondary/40">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${task.completed ? "bg-emerald-400" : "bg-primary"}`} />
                  <span className={`flex-1 text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  {task.completed && <Badge variant="success" className="text-xs">Done</Badge>}
                  {!task.completed && task.reminder_at && (
                    <Badge variant="secondary" className="text-xs">
                      <Bell className="mr-1 h-3 w-3" />{formatDateTime(task.reminder_at)}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming reminders */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-4 w-4 text-primary" /> Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground">
                <Bell className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">No upcoming reminders</p>
              </div>
            ) : (
              reminders.map((r) => {
                const urgent  = isUrgent(r.reminder_at);
                const overdue = isOverdue(r.reminder_at);
                return (
                  <div key={r.id} className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${overdue ? "bg-destructive" : urgent ? "bg-amber-400 animate-pulse" : "bg-primary"}`} />
                      <p className="text-sm font-medium leading-tight">{r.title}</p>
                    </div>
                    <p className="ml-4 text-xs text-muted-foreground">{formatDateTime(r.reminder_at)}</p>
                    {(urgent || overdue) && (
                      <Badge variant={overdue ? "destructive" : "warning"} className="ml-4 text-xs">
                        {overdue ? "Overdue" : "Soon"}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Overall Progress</span>
              </div>
              <span className="text-sm font-bold text-primary">
                {Math.round((completed / total) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completed} of {total} tasks completed
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
