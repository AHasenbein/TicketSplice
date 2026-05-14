const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export interface ApiValidationIssue {
  path?: Array<string | number>;
  message?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly issues?: ApiValidationIssue[]
  ) {
    super(message);
  }
}

function normalizeErrorMessage(message: string, statusCode: number): string {
  if (statusCode === 401 && message.toLowerCase().includes("missing bearer token")) {
    return "You need to log in to continue.";
  }

  return message;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.json().catch(() => null);
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TResponse> {
  const { token, headers, ...init } = options;
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers
      }
    });
  } catch {
    throw new ApiClientError("Network error. Check your connection and try again.", 0);
  }

  if (!response.ok) {
    const responseBody = (await parseResponseBody(response)) as
      | {
          message?: string;
          issues?: ApiValidationIssue[];
        }
      | null;
    const message = normalizeErrorMessage(responseBody?.message ?? "Request failed.", response.status);
    throw new ApiClientError(message, response.status, responseBody?.issues);
  }

  const responseBody = await parseResponseBody(response);
  return (responseBody ?? ({} as TResponse)) as TResponse;
}
