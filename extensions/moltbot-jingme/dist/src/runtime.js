/**
 * JingMe Runtime Context
 *
 * Stores and provides access to the Moltbot plugin API
 * throughout the plugin's lifetime.
 */
let runtimeApi = null;
/**
 * Set the runtime API context
 */
export function setJingmeRuntime(api) {
    runtimeApi = api;
}
/**
 * Get the current runtime API context
 */
export function getJingmeRuntime() {
    if (!runtimeApi) {
        throw new Error('JingMe runtime not initialized');
    }
    return runtimeApi;
}
//# sourceMappingURL=runtime.js.map