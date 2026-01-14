export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Branding/Hero */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 z-0" />
                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">Taskora</h1>
                    <p className="text-xl text-slate-300 leading-relaxed">
                        Turn your chaos into clarity. The modern task management solution for professionals who want to get things done.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-40"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-40"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex justify-center items-center bg-white p-8">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
