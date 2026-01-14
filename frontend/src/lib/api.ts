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
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

class APIClient {
  private static async request<T>(
    endpoint: string,
    method: RequestMethod,
    body?: any,
    token?: string
  ): Promise<T> {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    
    // ✅ Token from parameter or localStorage
    const finalToken = token || localStorage.getItem("token");
    if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;

    const config: RequestInit = { method, headers };
    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401) throw new Error("Unauthorized. Please login again.");
    if (response.status === 404) throw new Error("Endpoint not found.");
    if (!response.ok) {
      let data;
      try { data = await response.json(); } catch {}
      throw new Error(data?.detail || data?.message || "Request failed");
    }

    if (response.status === 204) return {} as T;

    return (await response.json()) as T;
  }

  static get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, "GET", undefined, token);
  }

  static post<T>(endpoint: string, body?: any, token?: string) {
    return this.request<T>(endpoint, "POST", body, token);
  }

  static put<T>(endpoint: string, body: any, token?: string) {
    return this.request<T>(endpoint, "PUT", body, token);
  }

  static delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, "DELETE", undefined, token);
  }

  static patch<T>(endpoint: string, body?: any, token?: string) {
    return this.request<T>(endpoint, "PATCH", body, token);
  }
}

export default APIClient;
