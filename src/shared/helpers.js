export const isMessagePrefixed = (message, prefix) => message.startsWith(prefix);
export const extractPrefixedPayload = (message, prefix) => message.slice(prefix.length);