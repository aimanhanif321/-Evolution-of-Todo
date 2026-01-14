module.exports = [
"[project]/frontend/src/context/AuthContext.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// "use client";
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import APIClient from '@/lib/api';
// import { useRouter, usePathname } from 'next/navigation';
// interface User {
//     id: string; // The backend might return 'user_id' or 'id', adjust based on response
//     email: string;
//     name: string;
// }
// interface AuthContextType {
//     user: User | null;
//     token: string | null;
//     login: (token: string, userData: User) => void;
//     logout: () => void;
//     isAuthenticated: boolean;
//     isLoading: boolean;
// }
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [token, setToken] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const router = useRouter();
//     const pathname = usePathname();
//     useEffect(() => {
//         // Check for stored token on mount
//         const storedToken = localStorage.getItem('token');
//         const storedUser = localStorage.getItem('user');
//         if (storedToken && storedUser) {
//             setToken(storedToken);
//             setUser(JSON.parse(storedUser));
//         }
//         setIsLoading(false);
//     }, []);
//     useEffect(() => {
//         // Route protection logic
//         const publicPaths = ['/auth/login', '/auth/register'];
//         if (!isLoading) {
//             if (!token && !publicPaths.includes(pathname)) {
//                 router.push('/auth/login');
//             } else if (token && publicPaths.includes(pathname)) {
//                 router.push('/dashboard');
//             }
//         }
//     }, [token, pathname, isLoading, router]);
//     const login = (newToken: string, userData: User) => {
//     setToken(newToken);
//     setUser(userData);
//     localStorage.setItem('token', newToken);
//     localStorage.setItem('user', JSON.stringify(userData));
//     router.push('/dashboard');
// };
//     const logout = () => {
//         setToken(null);
//         setUser(null);
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         router.push('/auth/login');
//     };
//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }
// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };
}),
"[next]/internal/font/google/inter_5972bc34.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "inter_5972bc34-module__OU16Qa__className",
});
}),
"[next]/internal/font/google/inter_5972bc34.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5972bc34.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Inter', 'Inter Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/frontend/src/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/context/AuthContext.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/inter_5972bc34.js [app-rsc] (ecmascript)");
;
;
;
;
const metadata = {
    title: 'Taskora - Organize. Focus. Finish.',
    description: 'A modern todo application'
};
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$inter_5972bc34$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].className,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/frontend/src/app/layout.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/src/app/layout.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/src/app/layout.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6239b8f9._.js.map