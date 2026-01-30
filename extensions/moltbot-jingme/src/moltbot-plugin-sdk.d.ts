/**
 * Moltbot Plugin SDK Type Definitions
 *
 * This file provides TypeScript type definitions for the Moltbot plugin system.
 * It's used during development when the actual clawdbot/plugin-sdk package
 * is not available. The real implementation is provided by the Moltbot runtime.
 */

/**
 * Logger interface for plugin logging
 */
export interface ILogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * Plugin configuration schema definition
 */
export interface PluginConfigSchema {
  type?: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Account configuration interface
 */
export interface AccountConfig {
  id: string;
  enabled?: boolean;
  [key: string]: any;
}

/**
 * Moltbot configuration interface
 */
export interface MoltbotConfig {
  [key: string]: any;
}

/**
 * Generic Channel plugin interface
 */
export interface ChannelPlugin<TAccount extends AccountConfig = AccountConfig> {
  id?: string;

  meta?: {
    label?: string;
    selectionLabel?: string;
    docsPath?: string;
    blurb?: string;
    order?: number;
    capabilities?: Record<string, any>;
  };

  capabilities?: {
    chatTypes?: string[];
    reactions?: boolean;
    threads?: boolean;
    media?: boolean;
    nativeCommands?: boolean;
    streamingBlocked?: boolean;
  };

  // Reload support
  reload?: {
    configPrefixes?: string[];
  };

  // Config schema (top-level)
  configSchema?: {
    schema?: PluginConfigSchema | Record<string, any>;
  };

  // Pairing helpers
  pairing?: {
    idLabel?: string;
    normalizeAllowEntry?: (entry: string) => string;
    notifyApproval?: (args: { cfg: MoltbotConfig; id: string }) => Promise<void>;
  };

  config?: {
    listAccountIds?(cfg: MoltbotConfig): string[];
    resolveAccount?(cfg: MoltbotConfig, id?: string): TAccount | null;
    isConfigured?(account: TAccount): boolean;
    setAccountEnabled?(
      cfg: MoltbotConfig,
      id: string,
      enabled: boolean,
    ): MoltbotConfig;
  };

  outbound?: {
    textChunkLimit?: number;
    deliveryMode?: 'direct' | 'batch';
    chunkerMode?: string;
    sendText?(options: {
      account: TAccount;
      recipientId: string;
      text: string;
      threadId?: string;
    }): Promise<any>;
  };

  gateway?: {
    startAccount?(options: {
      account: TAccount;
      abortSignal?: AbortSignal;
    }): Promise<void>;
    stopAccount?(account: TAccount): Promise<void>;
  };

  directory?: {
    resolveSelf?(account?: TAccount): Promise<any>;
    listGroups?(account: TAccount): Promise<any>;
    listPeers?(account?: TAccount): Promise<any>;
    listGroupsLive?(args: { account: TAccount; query?: string; limit?: number }): Promise<any>;
    listPeersLive?(args: { account: TAccount; query?: string; limit?: number }): Promise<any>;
  };

  dmPolicy?: {
    mode?(cfg: MoltbotConfig): string;
    allowlist?(cfg: MoltbotConfig): string[];
    blocklist?(cfg: MoltbotConfig): string[];
    allowAll?: boolean;
  };

  groupPolicy?: {
    mode?(cfg: MoltbotConfig): string;
    allowlist?(cfg: MoltbotConfig): string[];
    blocklist?(cfg: MoltbotConfig): string[];
    allowAll?: boolean;
  };

  setup?: {
    schema?: PluginConfigSchema;
    validate?(account: TAccount): string[] | string | boolean;
  };

  inbound?: {
    onMessage?(data: any): Promise<void>;
  };

  // Messaging helpers: target normalization and hints
  messaging?: {
    normalizeTarget?: (target: string) => string;
    targetResolver?: {
      looksLikeId?: (id: string) => boolean;
      hint?: string;
    };
  };

  // Security advisories
  security?: {
    collectWarnings?: (args: { cfg: MoltbotConfig }) => string[];
  };

  // Status and probe helpers
  status?: {
    defaultRuntime?: {
      accountId: string;
      running: boolean;
      lastStartAt: number | null;
      lastStopAt: number | null;
      lastError: string | null;
      port: number | null;
    };
    buildChannelSummary?: (args: { snapshot: any }) => any;
    probeAccount?: (args: any) => Promise<any>;
    buildAccountSnapshot?: (args: any) => any;
  };
}

/**
 * Moltbot Plugin API - Main interface for plugin integration
 */
export interface MoltbotPluginApi {
  logger: ILogger;
  config?: MoltbotConfig;
  runtime?: any; // Runtime context with channel routing and reply handling

  registerChannel(options: { plugin: ChannelPlugin<any> }): void;

  inbound?: {
    handleMessage?(data: any): Promise<void>;
  };

  registerCommand?(options: {
    name: string;
    description: string;
    handler: (args: any) => Promise<void>;
  }): void;

  on?(event: string, handler: (...args: any[]) => void): void;
  off?(event: string, handler: (...args: any[]) => void): void;
  emit?(event: string, ...args: any[]): void;
}

/**
 * Empty plugin config schema helper
 */
export function emptyPluginConfigSchema(): PluginConfigSchema {
  return {
    type: 'object',
    properties: {},
    additionalProperties: false,
  };
}

/**
 * Plugin configuration schema builder
 */
export function createPluginConfigSchema(
  props: Record<string, any>,
): PluginConfigSchema {
  return {
    type: 'object',
    properties: props,
    additionalProperties: false,
  };
}

// Common exported constants from plugin-sdk
export const PAIRING_APPROVED_MESSAGE: string;

/**
 * Plugin registration function type
 */
export type PluginRegisterFn = (api: MoltbotPluginApi) => void;

/**
 * Plugin definition interface
 */
export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  version?: string;
  configSchema?: PluginConfigSchema;
  register: PluginRegisterFn;
}
