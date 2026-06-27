import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Bell, CheckCircle2, Circle, Search, SlidersHorizontal } from "lucide-react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { formatDateTime, isOverdue, isUrgent } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

const FILTERS = ["All", "Pending", "Completed"];

const emptyForm = { title: "", description: "", reminder_at: "" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = () =>
    api.get("/tasks").then((r) => { setTasks(r.data.tasks); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      reminder_at: task.reminder_at ? new Date(task.reminder_at).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Missing title", "Title is required."); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        reminder_at: form.reminder_at || undefined,
      };
      if (editTask) {
        const r = await api.put(`/tasks/${editTask.id}`, payload);
        setTasks((prev) => prev.map((t) => (t.id === editTask.id ? r.data.task : t)));
        toast.success("Task updated");
      } else {
        const r = await api.post("/tasks", payload);
        setTasks((prev) => [r.data.task, ...prev]);
        toast.success("Task created");
      }
      setOpen(false);
    } catch (err) {
      toast.error("Failed to save", err.response?.data?.error || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      const r = await api.patch(`/tasks/${task.id}/complete`);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? r.data.task : t)));
    } catch { }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Delete failed", err.response?.data?.error || "Could not delete task.");
    }
  };

  const filtered = tasks
    .filter((t) =>
      (filter === "All") ||
      (filter === "Completed" && t.completed) ||
      (filter === "Pending" && !t.completed)
    )
    .filter((t) =>
      !search || t.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.filter((t) => !t.completed).length} pending · {tasks.filter((t) => t.completed).length} done
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Circle className="mb-3 h-10 w-10 opacity-20" />
            <p className="font-medium">No tasks found</p>
            <p className="mt-1 text-sm">
              {search ? "Try a different search term" : "Create your first task to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const urgent = !task.completed && isUrgent(task.reminder_at);
            const overdue = !task.completed && isOverdue(task.reminder_at);
            return (
              <div
                key={task.id}
                className={`group flex items-start gap-4 rounded-xl border px-5 py-4 transition-all hover:shadow-md ${task.completed
                    ? "border-border/40 bg-card/50 opacity-60"
                    : "border-border/60 bg-card hover:border-primary/30"
                  }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
                  title={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    : <Circle className="h-5 w-5" />
                  }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  )}
                  {task.reminder_at && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Bell className="h-3 w-3" />
                      <span>{formatDateTime(task.reminder_at)}</span>
                      {overdue && <Badge variant="destructive" className="py-0 text-[10px]">Overdue</Badge>}
                      {urgent && <Badge variant="warning" className="py-0 text-[10px]">Soon</Badge>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => handleDelete(task.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Add details (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-reminder" className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" /> Reminder
              </Label>
              <Input
                id="task-reminder"
                type="datetime-local"
                value={form.reminder_at}
                onChange={(e) => setForm({ ...form, reminder_at: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving…
                  </span>
                ) : editTask ? "Save changes" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
