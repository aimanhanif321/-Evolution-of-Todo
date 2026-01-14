module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/frontend/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/frontend/src/app/error.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/src/app/error.tsx [app-rsc] (ecmascript)"));
}),
"[project]/frontend/src/app/dashboard/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/src/app/dashboard/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/frontend/src/components/TaskList.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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
}),
"[project]/frontend/src/app/dashboard/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$TaskList$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/TaskList.tsx [app-rsc] (ecmascript)");
;
;
const metadata = {
    title: 'Dashboard | Taskora',
    description: 'Manage your tasks efficiently.'
};
function DashboardPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$TaskList$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/frontend/src/app/dashboard/page.tsx",
            lineNumber: 12,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/src/app/dashboard/page.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/src/app/dashboard/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/src/app/dashboard/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fb7969f2._.js.map