
// export const BASE_URL = "https://subhankaladi123-todo-app.hf.space/api";
// const API_URL = process.env.NEXT_PUBLIC_API_URL || BASE_URL;



// type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// class APIClient {
//   private static async request<T>(
//     endpoint: string,
//     method: RequestMethod,
//     body?: any,
//     token?: string
//   ): Promise<T> {
//     const headers: HeadersInit = { "Content-Type": "application/json" };
    
//     // ✅ Token from parameter or localStorage
//     const finalToken = token || localStorage.getItem("token");
//     if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;

//     const config: RequestInit = { method, headers };
//     if (body) config.body = JSON.stringify(body);

//     const response = await fetch(`${API_URL}${endpoint}`, config);

//     if (response.status === 401) throw new Error("Unauthorized. Please login again.");
//     if (response.status === 404) throw new Error("Endpoint not found.");
//     if (!response.ok) {
//       let data;
//       try { data = await response.json(); } catch {}
//       throw new Error(data?.detail || data?.message || "Request failed");
//     }

//     if (response.status === 204) return {} as T;

//     return (await response.json()) as T;
//   }

//   static get<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "GET", undefined, token);
//   }

//   static post<T>(endpoint: string, body?: any, token?: string) {
//     return this.request<T>(endpoint, "POST", body, token);
//   }

//   static put<T>(endpoint: string, body: any, token?: string) {
//     return this.request<T>(endpoint, "PUT", body, token);
//   }

//   static delete<T>(endpoint: string, token?: string) {
//     return this.request<T>(endpoint, "DELETE", undefined, token);
//   }

//   static patch<T>(endpoint: string, body?: any, token?: string) {
//     return this.request<T>(endpoint, "PATCH", body, token);
//   }
// }

// export default APIClient;


// src/lib/apiClient.ts

export const BASE_URL = "https://subhankaladi123-todo-app.hf.space/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || BASE_URL;

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
    const finalToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;

    const config: RequestInit = {
      method,
      headers,
      // ✅ send cookies / auth credentials for CORS
      credentials: "include",
    };

    if (body) config.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401) throw new Error("Unauthorized. Please login again.");
    if (response.status === 404) throw new Error("Endpoint not found.");
    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {}
      throw new Error(data?.detail || data?.message || "Request failed");
    }

    if (response.status === 204) return {} as T;

    return (await response.json()) as T;
  }

  // --- Methods ---
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
