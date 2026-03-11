import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Square, Trash2, Plus, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/store/WorkspaceStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PersonalTodo {
  id: string;
  text: string;
  done: boolean;
  created_at: string;
}

const PersonalTodoView = () => {
  const { activeSessionId, dumps } = useWorkspace();
  const { user } = useAuth();
  const [todos, setTodos] = useState<PersonalTodo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  // Load todos from actions table where type = todo-like
  const loadTodos = useCallback(async () => {
    if (!activeSessionId || !user) return;
    setLoading(true);
    const { data } = await supabase
      .from("actions")
      .select("*")
      .eq("session_id", activeSessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setTodos(data.map((a: any) => ({
        id: a.id,
        text: a.text,
        done: a.done,
        created_at: a.created_at,
      })));
    }
    setLoading(false);
  }, [activeSessionId, user]);

  useEffect(() => { loadTodos(); }, [loadTodos]);

  // Check for bulk todo dumps (5+ todo-type dumps)
  useEffect(() => {
    const todoDumps = dumps.filter((d) => d.type === "todo");
    if (todoDumps.length >= 5) {
      // Check if we've already shown the toast for this session
      const toastKey = `todo-toast-${activeSessionId}-${todoDumps.length}`;
      if (!sessionStorage.getItem(toastKey)) {
        sessionStorage.setItem(toastKey, "1");
        toast.info(`You have ${todoDumps.length} to-dos! Check the Personal section.`, {
          duration: 5000,
        });
      }
    }
  }, [dumps, activeSessionId]);

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const { error } = await supabase
      .from("actions")
      .update({ done: !todo.done })
      .eq("id", id);
    if (!error) {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim() || !activeSessionId || !user) return;
    const { data, error } = await supabase
      .from("actions")
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        text: newTodo.trim(),
        priority: "medium",
        done: false,
      })
      .select()
      .single();

    if (!error && data) {
      setTodos((prev) => [{
        id: data.id,
        text: data.text,
        done: data.done,
        created_at: data.created_at,
      }, ...prev]);
      setNewTodo("");
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("actions").delete().eq("id", id);
    if (!error) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const completedCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">Personal To-Do</span>
          {totalCount > 0 && (
            <span className="text-[11px] font-mono text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto cf-scrollbar p-4 space-y-3">
        {/* Add todo input */}
        <div className="flex gap-2">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTodo(); } }}
            placeholder="Add a new to-do..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring/50 transition-colors"
          />
          <button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className={cn(
              "px-3 py-2 rounded-lg text-[12px] font-medium transition-all",
              !newTodo.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-accent overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-cf-idea"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              {completedCount === totalCount && totalCount > 0
                ? "🎉 All done!"
                : `${Math.round((completedCount / totalCount) * 100)}% complete`}
            </p>
          </div>
        )}

        {/* Todo list */}
        <div className="space-y-1">
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card/70 hover:bg-card transition-all"
              >
                <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                  {todo.done ? (
                    <CheckSquare className="w-4 h-4 text-cf-idea" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground hover:text-cf-idea transition-colors" />
                  )}
                </button>
                <span className={cn(
                  "flex-1 text-[13px] leading-snug transition-all",
                  todo.done ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-accent text-muted-foreground/40 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                <ListTodo className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] text-muted-foreground">No to-dos yet</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">
                Add one above or dump 5+ to-dos to auto-create them
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalTodoView;
