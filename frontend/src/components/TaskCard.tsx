"use client";
import React, { useState } from "react";
import { Check, Trash2, Edit2, Clock } from "lucide-react";
import APIClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onUpdate, onEdit }: TaskCardProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Format date
  const date = new Date(task.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Toggle complete status
  const toggleComplete = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      await APIClient.patch(`/tasks/${task.id}/complete`, { completed: !task.completed }, token);
      onUpdate();
    } catch (err: any) {
      console.error("Failed to toggle task", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to update task";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    if (!token || loading) return;
    setLoading(true);
    try {
      await APIClient.delete(`/tasks/${task.id}`, token);
      onUpdate();
    } catch (err: any) {
      console.error("Failed to delete task", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to delete task";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 p-5 flex flex-col justify-between h-full ${
        task.completed ? "opacity-75 bg-slate-50" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={toggleComplete}
            disabled={loading}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? "bg-green-500 border-green-500 text-white"
                : "border-slate-300 hover:border-indigo-500 text-transparent"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              title="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={deleteTask}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3
          className={`font-semibold text-lg mb-2 leading-tight ${
            task.completed
              ? "text-slate-500 line-through decoration-slate-400"
              : "text-slate-800"
          }`}
        >
          {task.title}
        </h3>
        <p
          className={`text-sm leading-relaxed ${
            task.completed ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {task.description || "No description"}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Clock className="w-3.5 h-3.5" />
        <span>{date}</span>
      </div>
    </div>
  );
}


// "use client";
// import React, { useState } from 'react';
// import { Check, Trash2, Edit2, Clock } from 'lucide-react';
// import APIClient from '@/lib/api';
// import { useAuth } from '@/context/AuthContext';

// interface Task {
//     id: number;
//     title: string;
//     description: string;
//     completed: boolean;
//     created_at: string;
//     updated_at: string;
// }

// interface TaskCardProps {
//     task: Task;
//     onUpdate: () => void;
//     onEdit: (task: Task) => void;
// }

// export default function TaskCard({ task, onUpdate, onEdit }: TaskCardProps) {
//     const { user, token } = useAuth();
//     const [loading, setLoading] = useState(false);

//     // Format date
//     const date = new Date(task.created_at).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//     });

//     const toggleComplete = async () => {
//         if (!user || !token || loading) return;
//         setLoading(true);
//         try {
//             // Use PATCH /api/{user_id}/tasks/{id}/complete
//             // Body: { completed: !task.completed }
//             await APIClient.patch(`/api/${user.id}/tasks/${task.id}/complete`, { completed: !task.completed }, token);
//             onUpdate();
//         } catch (error) {
//             console.error('Failed to toggle task', error);
//             alert('Failed to update task');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const deleteTask = async () => {
//         if (!confirm('Are you sure you want to delete this task?')) return;
//         if (!user || !token || loading) return;
//         setLoading(true);
//         try {
//             await APIClient.delete(`/api/${user.id}/tasks/${task.id}`, token);
//             onUpdate();
//         } catch (error) {
//             console.error('Failed to delete task', error);
//             alert('Failed to delete task');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 p-5 flex flex-col justify-between h-full ${task.completed ? 'opacity-75 bg-slate-50' : ''}`}>
//             <div>
//                 <div className="flex items-start justify-between mb-3">
//                     <button
//                         onClick={toggleComplete}
//                         disabled={loading}
//                         className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed
//                                 ? 'bg-green-500 border-green-500 text-white'
//                                 : 'border-slate-300 hover:border-indigo-500 text-transparent'
//                             }`}
//                     >
//                         <Check className="w-3.5 h-3.5 stroke-[3]" />
//                     </button>
//                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button
//                             onClick={() => onEdit(task)}
//                             className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
//                             title="Edit task"
//                         >
//                             <Edit2 className="w-4 h-4" />
//                         </button>
//                         <button
//                             onClick={deleteTask}
//                             className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
//                             title="Delete task"
//                         >
//                             <Trash2 className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>

//                 <h3 className={`font-semibold text-lg mb-2 leading-tight ${task.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
//                     {task.title}
//                 </h3>

//                 <p className={`text-sm leading-relaxed ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
//                     {task.description || "No description"}
//                 </p>
//             </div>

//             <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400 font-medium">
//                 <Clock className="w-3.5 h-3.5" />
//                 <span>{date}</span>
//             </div>
//         </div>
//     );
// }
