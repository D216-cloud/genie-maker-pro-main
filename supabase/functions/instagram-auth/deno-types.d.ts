// Deno type declarations for instagram-auth edge function (development only)

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare class Request {
  method: string;
  headers: Headers;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare class Response {
  constructor(body?: any, init?: ResponseInit);
}

declare interface ResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

declare class Headers {
  get(name: string): string | null;
}

declare function fetch(input: string, init?: any): Promise<Response>;

interface Console {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
}

declare const console: Console;

