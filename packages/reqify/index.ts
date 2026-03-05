import {
  HttpMethod,
  HttpStatusCode,
  ApiUrl,
  JsonBody,
} from "../../types/api-types.js";

export interface request2httpOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface request2httpResponse<T = any> {
  status: HttpStatusCode;
  data: T;
  headers: Headers;
}

export const request2http = async <T = any>(
  url: ApiUrl,
  options: request2httpOptions = {},
): Promise<request2httpResponse<T>> => {
  const { method = "GET", headers = {}, body } = options;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status as HttpStatusCode,
    data: data as T,
    headers: response.headers,
  };
};
