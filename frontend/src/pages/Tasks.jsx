import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Bell, CheckCircle2, Circle, Search, SlidersHorizontal, Calendar, Clock } from "lucide-react";
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const { toast } = useToast();

  const load = () =>
    api.get("/tasks").then((r) => { setTasks(r.data.tasks); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setOpen(true); setShowCalendar(false); setShowTimePicker(false); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      reminder_at: task.reminder_at ? new Date(task.reminder_at).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
    setShowCalendar(false);
    setShowTimePicker(false);
  };

  const setQuickReminder = (type) => {
    const now = new Date();
    if (type === 'today') {
      now.setHours(now.getHours() + 1);
    } else if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
    } else if (type === 'next-week') {
      now.setDate(now.getDate() + 7);
      now.setHours(9, 0, 0, 0);
    }
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    setForm({ ...form, reminder_at: localISOTime });
  };

  const formDate = form.reminder_at ? form.reminder_at.split('T')[0] : "";
  const formTime = form.reminder_at ? form.reminder_at.split('T')[1] : "";

  const handleDateTimeChange = (dateVal, timeVal) => {
    if (!dateVal) {
      setForm({ ...form, reminder_at: "" });
      return;
    }
    const time = timeVal || "09:00";
    setForm({ ...form, reminder_at: `${dateVal}T${time}` });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatSimpleDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeLabel = (timeStr) => {
    if (!timeStr) return "Select time";
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayHr = hr % 12 || 12;
    return `${displayHr}:${m} ${ampm}`;
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const days = getDaysInMonth(calendarMonth);
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

    return (
      <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={prevMonth} className="p-1 hover:bg-muted rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground">
            &lt;
          </button>
          <span className="text-xs font-semibold">{monthNames[month]} {year}</span>
          <button type="button" onClick={nextMonth} className="p-1 hover:bg-muted rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground">
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground mb-1">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateStr = day.toISOString().split('T')[0];
            const isSelected = formDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  handleDateTimeChange(dateStr, formTime);
                  setShowCalendar(false);
                }}
                className={`h-7 w-7 text-xs rounded-lg transition-colors flex items-center justify-center ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : isToday
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimePicker = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      const hh = String(h).padStart(2, '0');
      times.push(`${hh}:00`);
      times.push(`${hh}:30`);
    }

    return (
      <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl backdrop-blur-md">
        <div className="space-y-0.5">
          {times.map((t) => {
            const isSelected = formTime.substring(0, 5) === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  handleDateTimeChange(formDate, t);
                  setShowTimePicker(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {formatTimeLabel(t)}
              </button>
            );
          })}
        </div>
      </div>
    );
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
            placeholder="Search tasks..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              size="sm"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground opacity-40 mb-3" />
            <p className="font-semibold text-muted-foreground">No tasks found</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Get started by creating a new task.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const overdue = isOverdue(task.reminder_at);
            const urgent = isUrgent(task.reminder_at);

            return (
              <div
                key={task.id}
                className="group flex items-start justify-between gap-4 p-4 border rounded-xl bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(task)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary fill-primary/10" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium leading-none block ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {task.reminder_at && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium mt-1 text-muted-foreground">
                        <Bell className={`h-3 w-3 ${overdue ? "text-destructive" : ""}`} />
                        <span className={overdue ? "text-destructive font-semibold" : ""}>
                          {formatDateTime(task.reminder_at)}
                        </span>
                        {overdue && <Badge variant="destructive" className="py-0 text-[10px]">Overdue</Badge>}
                        {urgent && <Badge variant="warning" className="py-0 text-[10px]">Soon</Badge>}
                      </div>
                    )}
                  </div>
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
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5" /> Reminder Date & Time
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full pl-9 justify-start text-left font-normal h-9 bg-background"
                  >
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <span className="truncate">
                      {formDate ? formatSimpleDate(formDate) : "Select date"}
                    </span>
                  </Button>
                  {showCalendar && renderCalendar()}
                </div>
                <div className="relative">
                  <Input
                    type="time"
                    className="pl-9 cursor-pointer"
                    value={formTime}
                    onChange={(e) => handleDateTimeChange(formDate, e.target.value)}
                  />
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => setQuickReminder('today')}
                >
                  Today (+1h)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => setQuickReminder('tomorrow')}
                >
                  Tomorrow (9 AM)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 rounded-full hover:bg-primary/5 hover:text-primary transition-colors"
                  onClick={() => setQuickReminder('next-week')}
                >
                  Next Week
                </Button>
                {form.reminder_at && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2.5 text-destructive hover:text-destructive hover:bg-destructive/5 rounded-full"
                    onClick={() => setForm({ ...form, reminder_at: "" })}
                  >
                    Clear
                  </Button>
                )}
              </div>
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
