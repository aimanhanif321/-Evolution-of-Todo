module.exports = [
"[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/api.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
class APIClient {
    static async request(endpoint, method, body, token) {
        const headers = {
            "Content-Type": "application/json"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const config = {
            method,
            headers
        };
        if (body) config.body = JSON.stringify(body);
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            // Unauthorized
            if (response.status === 401) {
                throw new Error("Unauthorized. Please login again.");
            }
            // No Content
            if (response.status === 204) return {};
            let data;
            try {
                data = await response.json();
            } catch  {
                throw new Error("Failed to parse server response");
            }
            if (!response.ok) {
                let errorMessage = "An error occurred";
                if (data?.detail) {
                    if (Array.isArray(data.detail)) {
                        errorMessage = data.detail.map((d)=>d.msg).join(", ");
                    } else {
                        errorMessage = data.detail || data.message || errorMessage;
                    }
                } else if (data?.message) {
                    errorMessage = data.message;
                }
                throw new Error(errorMessage);
            }
            return data;
        } catch (err) {
            throw new Error(err.message || "Network error");
        }
    }
    static get(endpoint, token) {
        return this.request(endpoint, "GET", undefined, token);
    }
    static post(endpoint, body, token) {
        return this.request(endpoint, "POST", body, token);
    }
    static put(endpoint, body, token) {
        return this.request(endpoint, "PUT", body, token);
    }
    static patch(endpoint, body, token) {
        return this.request(endpoint, "PATCH", body, token);
    }
    static delete(endpoint, token) {
        return this.request(endpoint, "DELETE", undefined, token);
    }
}
const __TURBOPACK__default__export__ = APIClient;
}),
"[project]/frontend/src/components/TaskForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
__turbopack_context__.s([
    "default",
    ()=>TaskForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
"use client";
;
;
;
;
;
function TaskForm({ onClose, onSuccess, editTask }) {
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [description, setDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (editTask) {
            setTitle(editTask.title);
            setDescription(editTask.description || "");
        }
    }, [
        editTask
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        try {
            if (editTask) {
                // Update task
                await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].put(`/api/tasks/${editTask.id}`, {
                    title,
                    description,
                    completed: editTask.completed
                }, token);
            } else {
                // Create new task
                await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post(`/api/tasks`, {
                    title,
                    description
                }, token);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to save task", err);
            alert(err.message || "Failed to save task");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white w-full max-w-lg rounded-xl shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center p-4 border-b",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold",
                            children: editTask ? "Edit Task" : "New Task"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/TaskForm.tsx",
                            lineNumber: 185,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {}, void 0, false, {
                                fileName: "[project]/frontend/src/components/TaskForm.tsx",
                                lineNumber: 186,
                                columnNumber: 37
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/TaskForm.tsx",
                            lineNumber: 186,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/TaskForm.tsx",
                    lineNumber: 184,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "p-4 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            required: true,
                            placeholder: "Title",
                            value: title,
                            onChange: (e)=>setTitle(e.target.value),
                            className: "w-full border p-2 rounded"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/TaskForm.tsx",
                            lineNumber: 190,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            placeholder: "Description",
                            value: description,
                            onChange: (e)=>setDescription(e.target.value),
                            className: "w-full border p-2 rounded"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/TaskForm.tsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: loading,
                            className: "bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2",
                            children: [
                                loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "animate-spin w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/components/TaskForm.tsx",
                                    lineNumber: 211,
                                    columnNumber: 25
                                }, this),
                                editTask ? "Save Changes" : "Create Task"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/components/TaskForm.tsx",
                            lineNumber: 206,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/TaskForm.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/components/TaskForm.tsx",
            lineNumber: 183,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/src/components/TaskForm.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/src/components/TaskList.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// "use client";
// import React, { useEffect, useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import APIClient from '@/lib/api';
// import TaskCard from './TaskCard';
// import TaskForm from './TaskForm';
// import { Plus, Loader2, Inbox } from 'lucide-react';
// interface Task {
//     id: number;
//     user_id: string;
//     title: string;
//     description: string;
//     completed: boolean;
//     created_at: string;
//     updated_at: string;
// }
// export default function TaskList() {
//     const { user, token } = useAuth();
//     const [tasks, setTasks] = useState<Task[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [editingTask, setEditingTask] = useState<Task | null>(null);
//     const fetchTasks = async () => {
//         if (!user || !token) return;
//         try {
//             // GET /api/{user_id}/tasks
//             const res = await APIClient.get<{ data: Task[] }>(`/api/${user.id}/tasks`, token);
//             // Ensure we set tasks to an array. The API contract said response structure is { success: true, data: [...] }
//             setTasks(res.data || []);
//         } catch (error) {
//             console.error('Failed to fetch tasks', error);
//         } finally {
//             setLoading(false);
//         }
//     };
//     useEffect(() => {
//         if (user && token) {
//             fetchTasks();
//         }
//     }, [user, token]);
//     const handleEdit = (task: Task) => {
//         setEditingTask(task);
//         setIsFormOpen(true);
//     };
//     const handleSuccess = () => {
//         fetchTasks();
//     };
//     // Filter tasks if needed, or sort
//     const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
//     if (loading) {
//         return (
//             <div className="flex h-64 items-center justify-center">
//                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
//             </div>
//         );
//     }
//     return (
//         <div>
//             <div className="flex items-center justify-between mb-8">
//                 <div>
//                     <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
//                     <p className="text-slate-500 mt-1">
//                         You have {tasks.filter(t => !t.completed).length} incomplete tasks.
//                     </p>
//                 </div>
//                 <button
//                     onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
//                     className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 font-medium transition-all hover:scale-[1.02]"
//                 >
//                     <Plus className="w-5 h-5" />
//                     Add Task
//                 </button>
//             </div>
//             {tasks.length === 0 ? (
//                 <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
//                     <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
//                         <Inbox className="w-8 h-8 text-slate-400" />
//                     </div>
//                     <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks yet</h3>
//                     <p className="text-slate-500 max-w-sm mx-auto mb-6">
//                         Get started by creating your first task using the button above.
//                     </p>
//                     <button
//                         onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
//                         className="text-indigo-600 font-semibold hover:text-indigo-700"
//                     >
//                         Create a task
//                     </button>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {sortedTasks.map((task) => (
//                         <TaskCard
//                             key={task.id}
//                             task={task}
//                             onUpdate={fetchTasks}
//                             onEdit={() => handleEdit(task)}
//                         />
//                     ))}
//                 </div>
//             )}
//             {isFormOpen && (
//                 <TaskForm
//                     onClose={() => setIsFormOpen(false)}
//                     onSuccess={handleSuccess}
//                     editTask={editingTask}
//                 />
//             )}
//         </div>
//     );
// }
__turbopack_context__.s([
    "default",
    ()=>TaskList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$TaskForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/TaskForm.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function TaskList() {
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [editingTask, setEditingTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchTasks = async ()=>{
        if (!token) return;
        setLoading(true);
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get("/api/tasks", token);
            setTasks(data);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
            alert(err.message || "Failed to fetch tasks");
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchTasks();
    }, [
        token
    ]);
    const handleEdit = (task)=>{
        setEditingTask(task);
        setShowForm(true);
    };
    const handleSuccess = ()=>{
        fetchTasks();
        setEditingTask(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "mb-4 bg-green-600 text-white px-4 py-2 rounded",
                onClick: ()=>setShowForm(true),
                children: "Add Task"
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/TaskList.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "Loading tasks..."
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/TaskList.tsx",
                lineNumber: 182,
                columnNumber: 9
            }, this) : tasks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: "No tasks found."
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/TaskList.tsx",
                lineNumber: 184,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-2",
                children: tasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "border p-3 rounded flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "font-semibold",
                                        children: task.title
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/TaskList.tsx",
                                        lineNumber: 190,
                                        columnNumber: 17
                                    }, this),
                                    task.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm",
                                        children: task.description
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/TaskList.tsx",
                                        lineNumber: 191,
                                        columnNumber: 38
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/TaskList.tsx",
                                lineNumber: 189,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "bg-blue-600 text-white px-2 py-1 rounded",
                                onClick: ()=>handleEdit(task),
                                children: "Edit"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/TaskList.tsx",
                                lineNumber: 193,
                                columnNumber: 15
                            }, this)
                        ]
                    }, task.id, true, {
                        fileName: "[project]/frontend/src/components/TaskList.tsx",
                        lineNumber: 188,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/TaskList.tsx",
                lineNumber: 186,
                columnNumber: 9
            }, this),
            showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$TaskForm$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                onClose: ()=>setShowForm(false),
                onSuccess: handleSuccess,
                editTask: editingTask
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/TaskList.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/components/TaskList.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>X
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M18 6 6 18",
            key: "1bl5f8"
        }
    ],
    [
        "path",
        {
            d: "m6 6 12 12",
            key: "d8bk6v"
        }
    ]
];
const X = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("x", __iconNode);
;
 //# sourceMappingURL=x.js.map
}),
"[project]/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "X",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript)");
}),
"[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>LoaderCircle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21 12a9 9 0 1 1-6.219-8.56",
            key: "13zald"
        }
    ]
];
const LoaderCircle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("loader-circle", __iconNode);
;
 //# sourceMappingURL=loader-circle.js.map
}),
"[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Loader2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=frontend_9fb2850e._.js.map