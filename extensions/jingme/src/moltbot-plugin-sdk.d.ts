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
}

/**
 * Moltbot Plugin API - Main interface for plugin integration
 */
export interface MoltbotPluginApi {
  logger: ILogger;
  config?: MoltbotConfig;

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
