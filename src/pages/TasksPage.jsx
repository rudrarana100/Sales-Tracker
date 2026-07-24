import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { getTasks,  } from "@/features/leads/api/tasksApi";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("Rudra Rana");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState("medium");

  async function loadTasks() {
  try {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load tasks");
  } finally {
    setLoading(false);
  }
}
useEffect(() => {
  loadTasks();
}, []);                 
async function toggleTask(task) {
  try {
    const updated = await updateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
      completed_at:
        task.status === "completed"
          ? null
          : new Date().toISOString(),
    });


    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updated : t))
    );

    toast.success("Task updated");
  } catch (err) {
    console.error(err);
    toast.error("Failed to update task");
  }

}
async function deleteTask(id) {
  try {
    await deleteTaskApi(id);

    setTasks((prev) => prev.filter((t) => t.id !== id));

    toast.success("Task deleted");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete task");
  }
}
async function handleCreateTask(e) {
  e.preventDefault();

  if (!title.trim()) return;

  try {
    const task = await createTask({
      title: title.trim(),
      assigned_to: assignee,
      due_date: dueDate,
      priority,
      status: "pending",
    });

    setTasks((prev) => [task, ...prev]);

    toast.success("Task created!");

    setTitle("");
    setAssignee("Rudra Rana");
    setPriority("medium");
    setDueDate(new Date().toISOString().split("T")[0]);
    setShowModal(false);
  } catch (err) {
    console.error(err);
    toast.error("Failed to create task");
  }
}
  const todayStr = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "today") return t.dueDate === todayStr;
    if (filter === "high") return t.priority === "high";
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Organize and execute daily sales tasks and assignments."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 px-3.5 py-2 text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Task</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Tasks" },
          { id: "pending", label: "Pending" },
          { id: "today", label: "Due Today" },
          { id: "high", label: "High Priority 🔥" },
          { id: "completed", label: "Completed" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all border ${
              filter === f.id
                ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white border-transparent shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task Cards Container */}
      <SectionCard title={<span className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-blue-500" /> Tasks List ({filteredTasks.length})</span>}>
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No tasks found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Change filters or create a new task above.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  t.completed
                    ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-[0_2px_6px_rgba(15,23,42,0.02)]"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {t.completed ? (
                      <CheckSquare className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Square className="h-4.5 w-4.5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-100"}`}>
                      {t.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="h-3 w-3" />
                        {t.assignee}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3" />
                        {t.dueDate}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        t.priority === "high"
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {t.priority} priority
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Task Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="Rudra Rana">Rudra Rana</option>
                    <option value="Alex Vance">Alex Vance</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High 🔥</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 text-white dark:bg-blue-600 px-4 py-2 text-xs font-bold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

