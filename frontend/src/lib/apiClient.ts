export interface APIResponse<T = any> {
  status: "success" | "error";
  message?: string;
  count?: number;
  data?: T;
}

// IMPORTANT
const API_BASE =
  import.meta.env.VITE_API_URL || "";

class APIClient {
  private getHeaders(
    isMultipart = false
  ): HeadersInit {

    const headers:
      Record<string, string> = {};

    if (!isMultipart) {
      headers["Content-Type"] =
        "application/json";
    }

    const token =
      localStorage.getItem(
        "paybridge_token"
      );

    if (token) {
      headers["Authorization"] =
        `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(
    response: Response
  ): Promise<T> {

    const isJson =
      response.headers
        .get("content-type")
        ?.includes(
          "application/json"
        );

    const data =
      isJson
        ? await response.json()
        : null;

    if (!response.ok) {

      if (
        response.status === 401
      ) {
        this.clearSession();

        if (
          ![
            "/",
            "/login",
            "/register"
          ].includes(
            window.location.pathname
          )
        ) {
          window.location.href =
            "/login";
        }
      }

      throw new Error(
        data?.message ||
        response.statusText ||
        "Something went wrong"
      );
    }

    return data as T;
  }

  private buildURL(
    url: string
  ): string {

    if (
      url.startsWith(
        "http"
      )
    ) {
      return url;
    }

    return `${API_BASE}${url}`;
  }

  public async get<T>(
    url: string
  ): Promise<T> {

    const response =
      await fetch(
        this.buildURL(url),
        {
          method: "GET",
          headers:
            this.getHeaders()
        }
      );

    return this.handleResponse<T>(
      response
    );
  }

  public async post<T>(
    url: string,
    body?: any
  ): Promise<T> {

    const response =
      await fetch(
        this.buildURL(url),
        {
          method: "POST",
          headers:
            this.getHeaders(),
          body:
            body
              ? JSON.stringify(
                body
              )
              : undefined
        }
      );

    return this.handleResponse<T>(
      response
    );
  }

  public async put<T>(
    url: string,
    body: any
  ): Promise<T> {

    const response =
      await fetch(
        this.buildURL(url),
        {
          method: "PUT",
          headers:
            this.getHeaders(),
          body:
            JSON.stringify(
              body
            )
        }
      );

    return this.handleResponse<T>(
      response
    );
  }

  public async delete<T>(
    url: string
  ): Promise<T> {

    const response =
      await fetch(
        this.buildURL(url),
        {
          method:
            "DELETE",
          headers:
            this.getHeaders()
        }
      );

    return this.handleResponse<T>(
      response
    );
  }

  public async upload<T>(
    url: string,
    formData: FormData
  ): Promise<T> {

    const response =
      await fetch(
        this.buildURL(url),
        {
          method: "POST",
          headers:
            this.getHeaders(
              true
            ),
          body:
            formData
        }
      );

    return this.handleResponse<T>(
      response
    );
  }

  public setSession(
    token: string,
    refreshToken: string,
    user: any
  ) {

    localStorage.setItem(
      "paybridge_token",
      token
    );

    localStorage.setItem(
      "paybridge_refresh_token",
      refreshToken
    );

    localStorage.setItem(
      "paybridge_user",
      JSON.stringify(
        user
      )
    );
  }

  public clearSession() {

    localStorage.removeItem(
      "paybridge_token"
    );

    localStorage.removeItem(
      "paybridge_refresh_token"
    );

    localStorage.removeItem(
      "paybridge_user"
    );
  }

  public getUser() {

    const user =
      localStorage.getItem(
        "paybridge_user"
      );

    return user
      ? JSON.parse(user)
      : null;
  }

  public isAuthenticated() {

    return !!localStorage.getItem(
      "paybridge_token"
    );
  }
}

export const apiClient =
  new APIClient();

export default apiClient;