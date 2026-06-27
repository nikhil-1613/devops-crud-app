import { useEffect, useState } from "react";
import { Bell, Clock, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, isOverdue, isUrgent } from "@/lib/utils";

function ReminderRow({ task }) {
  const overdue = isOverdue(task.reminder_at);
  const urgent  = isUrgent(task.reminder_at);

  return (
    <div className={`flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors ${
      overdue ? "border-destructive/30 bg-destructive/5" :
      urgent  ? "border-amber-500/30 bg-amber-500/5" :
                "border-border/60 bg-card hover:border-primary/20"
    }`}>
      <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
        overdue ? "bg-destructive" :
        urgent  ? "bg-amber-400 animate-pulse" :
                  "bg-primary"
      }`} />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium">{task.title}</p>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDateTime(task.reminder_at)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {overdue && <Badge variant="destructive">Overdue</Badge>}
        {urgent && !overdue && <Badge variant="warning">Due soon</Badge>}
        {!overdue && !urgent && <Badge variant="secondary">Upcoming</Badge>}
      </div>
    </div>
  );
}

export default function Reminders() {
  const [upcoming, setUpcoming] = useState([]);
  const [all,      setAll]      = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reminders/upcoming").then((r) => setUpcoming(r.data.reminders)),
      api.get("/reminders").then((r) => setAll(r.data.reminders)),
    ]).finally(() => setLoading(false));
  }, []);

  const overdue  = all.filter((t) => isOverdue(t.reminder_at));
  const upcoming24 = upcoming;
  const future   = all.filter((t) => !isOverdue(t.reminder_at) && !isUrgent(t.reminder_at)
                              && !upcoming.find((u) => u.id === t.id));

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-card border border-border" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reminders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {all.length} total reminder{all.length !== 1 ? "s" : ""} · {overdue.length} overdue
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-xl font-bold">{loading ? "—" : overdue.length}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Bell className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xl font-bold">{loading ? "—" : upcoming24.length}</p>
              <p className="text-xs text-muted-foreground">Next 24h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{loading ? "—" : all.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue */}
      {!loading && overdue.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Overdue
          </h2>
          {overdue.map((t) => <ReminderRow key={t.id} task={t} />)}
          <Separator />
        </section>
      )}

      {/* Next 24 hours */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Bell className="h-4 w-4 text-primary" /> Next 24 Hours
        </h2>
        {loading ? <LoadingSkeleton /> : upcoming24.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-10 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm">No reminders in the next 24 hours</p>
            </CardContent>
          </Card>
        ) : (
          upcoming24.filter((t) => !isOverdue(t.reminder_at)).map((t) => <ReminderRow key={t.id} task={t} />)
        )}
      </section>

      {/* All upcoming */}
      {!loading && future.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-primary" /> Later
          </h2>
          {future.map((t) => <ReminderRow key={t.id} task={t} />)}
        </section>
      )}
    </div>
  );
}
