module.exports = [
"[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// // src/lib/api.ts
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
// class APIClient {
//   private static async request<T>(
//     endpoint: string,
//     method: RequestMethod,
//     body?: any,
//     token?: string
//   ): Promise<T> {
//     const headers: HeadersInit = { "Content-Type": "application/json" };
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//     const config: RequestInit = { method, headers };
//     if (body) config.body = JSON.stringify(body);
//     const response = await fetch(`${API_URL}${endpoint}`, config);
//     if (response.status === 401) throw new Error("Unauthorized. Please login again.");
//     if (response.status === 404) throw new Error("Endpoint not found.");
//     if (response.status === 405) throw new Error("Method not allowed.");
//     if (!response.ok) {
//       let data;
//       try {
//         data = await response.json();
//       } catch {
//         throw new Error("Failed to parse server response");
//       }
//       throw new Error(data?.detail || data?.message || "Request failed");
//     }
//     if (response.status === 204) return {} as T;
//     return (await response.json()) as T;
//   }
//   static get<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "GET", undefined, token);
//   }
//   static post<T>(endpoint: string, body: any, token?: string) {
//     return this.request<T>(endpoint, "POST", body, token);
//   }
//   static put<T>(endpoint: string, body: any, token?: string) {
//     return this.request<T>(endpoint, "PUT", body, token);
//   }
//   static delete<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "DELETE", undefined, token);
//   }
// }
// export default APIClient;
// src/lib/api.ts
// src/lib/api.ts
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
        // ✅ Token from parameter or localStorage
        const finalToken = token || localStorage.getItem("token");
        if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;
        const config = {
            method,
            headers
        };
        if (body) config.body = JSON.stringify(body);
        const response = await fetch(`${API_URL}${endpoint}`, config);
        if (response.status === 401) throw new Error("Unauthorized. Please login again.");
        if (response.status === 404) throw new Error("Endpoint not found.");
        if (!response.ok) {
            let data;
            try {
                data = await response.json();
            } catch  {}
            throw new Error(data?.detail || data?.message || "Request failed");
        }
        if (response.status === 204) return {};
        return await response.json();
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
    static delete(endpoint, token) {
        return this.request(endpoint, "DELETE", undefined, token);
    }
    static patch(endpoint, body, token) {
        return this.request(endpoint, "PATCH", body, token);
    }
}
const __TURBOPACK__default__export__ = APIClient;
}),
"[project]/frontend/src/app/auth/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/app/login/page.tsx
__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function LoginPage() {
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post("/api/auth/login", {
                email,
                password
            });
            const token = res.access_token;
            // Decode token for user info (if available)
            let user = {
                id: "unknown",
                email,
                name: "User"
            };
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                user = {
                    id: payload.sub || payload.user_id || "unknown",
                    email: payload.email || email,
                    name: payload.name || "User"
                };
            } catch  {}
            login(token, user);
        } catch (err) {
            setError(err.message || "Login failed");
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-md mx-auto mt-16",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-3xl font-bold text-slate-900",
                children: "Welcome back"
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-6 mt-6",
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 rounded bg-red-50 text-red-500",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                        lineNumber: 51,
                        columnNumber: 19
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "email",
                        placeholder: "Email",
                        required: true,
                        value: email,
                        onChange: (e)=>setEmail(e.target.value),
                        className: "w-full px-4 py-3 border rounded"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        placeholder: "Password",
                        required: true,
                        value: password,
                        onChange: (e)=>setPassword(e.target.value),
                        className: "w-full px-4 py-3 border rounded"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: loading,
                        className: "w-full py-3 bg-indigo-600 text-white rounded",
                        children: loading ? "Signing in..." : "Sign in"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4 text-center text-sm",
                children: [
                    "Don't have an account?",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/auth/register",
                        className: "text-indigo-600",
                        children: "Sign up"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/auth/login/page.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/app/auth/login/page.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=frontend_src_a0503dfc._.js.map