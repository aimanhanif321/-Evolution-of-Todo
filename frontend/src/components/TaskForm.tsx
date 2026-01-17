// "use client";
// import React, { useState, useEffect } from 'react';
// import APIClient from '@/lib/api';
// import { useAuth } from '@/context/AuthContext';
// import { X, Loader2 } from 'lucide-react';

// interface Task {
//     id: number;
//     title: string;
//     description: string;
// }

// interface TaskFormProps {
//     onClose: () => void;
//     onSuccess: () => void;
//     editTask?: Task | null;
// }

// export default function TaskForm({ onClose, onSuccess, editTask }: TaskFormProps) {
//     const { user, token } = useAuth();
//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (editTask) {
//             setTitle(editTask.title);
//             setDescription(editTask.description);
//         }
//     }, [editTask]);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!user || !token) return;

//         setLoading(true);
//         try {
//             if (editTask) {
//                 // PUT /api/{user_id}/tasks/{id}
//                 await APIClient.put(`/api/${user.id}/tasks/${editTask.id}`, { title, description, completed: false }, token); // Note: API might require completed field
//             } else {
//                 // POST /api/{user_id}/tasks
//                 await APIClient.post(`/api/${user.id}/tasks`, { title, description }, token);
//             }
//             onSuccess();
//             onClose();
//         } catch (error) {
//             console.error("Failed to save task", error);
//             alert("Failed to save task");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
//                 <div className="flex items-center justify-between p-6 border-b border-slate-100">
//                     <h2 className="text-xl font-bold text-slate-900">
//                         {editTask ? 'Edit Task' : 'New Task'}
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
//                     >
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                     <div className="space-y-2">
//                         <label className="text-sm font-medium text-slate-700">Title</label>
//                         <input
//                             type="text"
//                             required
//                             value={title}
//                             onChange={(e) => setTitle(e.target.value)}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400"
//                             placeholder="What needs to be done?"
//                             autoFocus
//                         />
//                     </div>

//                     <div className="space-y-2">
//                         <label className="text-sm font-medium text-slate-700">Description</label>
//                         <textarea
//                             value={description}
//                             onChange={(e) => setDescription(e.target.value)}
//                             className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 min-h-[120px] resize-none"
//                             placeholder="Add some details..."
//                         />
//                     </div>

//                     <div className="pt-4 flex justify-end gap-3">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading && <Loader2 className="w-4 h-4 animate-spin" />}
//                             {editTask ? 'Save Changes' : 'Create Task'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }
"use client";
"use client";

import React, { useState, useEffect } from "react";
import APIClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X, Loader2 } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

interface TaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editTask?: Task | null;
}

export default function TaskForm({
  onClose,
  onSuccess,
  editTask,
}: TaskFormProps) {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
    }
  }, [editTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("You must be logged in to create a task.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
  title: title.trim(),
  description: description.trim(),
  completed: editTask?.completed ?? false,  // ✅ use ?? fallback
  

};

      if (editTask) {
        await APIClient.put(`/api/tasks/${editTask.id}`, payload, token);
      } else {
        await APIClient.post(`/api/tasks`, payload, token);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
  console.error("Failed to save task", err);
  const msg =
    typeof err === "string"
      ? err
      : err?.message ||
        (Array.isArray(err?.detail) ? err.detail.map(d => d.msg).join(", ") : "Failed to save task");
  alert(msg);
}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {editTask ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Title"
            required
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editTask ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
