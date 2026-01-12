// Local minimal declarations to satisfy TypeScript in editor (development only)

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  // Minimal typing for serve; handler receives a Request and returns a Response or Promise<Response>
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  // Minimal createClient signature used in this project
  export function createClient(url: string, key: string): any;
}

// Deno global env shim
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Minimal DOM-like types to satisfy the handler signatures in this file while in VS Code
// These are intentionally broad (any) because the runtime is Deno in deployment and full types
// are not necessary in the editor for local diagnostics.
declare type Request = any;
declare type Response = any;

declare function fetch(input: any, init?: any): Promise<any>;

declare function console.log(...args: any[]): void;
declare function console.error(...args: any[]): void;
