import * as http from 'node:http';
import type { ResolvedJingmeAccount } from './types.js';
interface WebhookServer {
    server: http.Server | null;
    port: number;
    stop: () => void;
}
export declare function startWebhookServer(account: ResolvedJingmeAccount, abortSignal?: AbortSignal): WebhookServer;
export {};
//# sourceMappingURL=webhook.d.ts.map