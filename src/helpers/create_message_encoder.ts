import { getEncoding, type TiktokenEncoding } from 'js-tiktoken';
import QuickLRU from 'quick-lru';

export type MessageEncoder = {
  encode(input: string): Uint32Array;
  calculate_tokens(text: string): Promise<number>;
};

export function create_message_encoder(
  encoding: TiktokenEncoding,
): MessageEncoder {
  const tokenizer = getEncoding(encoding);

  function encode(input: string): Uint32Array {
    return new Uint32Array(tokenizer.encode(input));
  }

  async function calculate_tokens(text: string) {
    // TODO: use a better fix in the tokenizer
    // See https://github.com/transitive-bullshit/chatgpt-api/blob/main/src/chatgpt-api.ts
    text = text.replace(/<\|endoftext\|>/g, '');

    return tokenizer.encode(text).length;
  }

  return {
    encode,
    calculate_tokens,
  };
}

const encoders = new QuickLRU<TiktokenEncoding, MessageEncoder>({
  maxSize: 100,
});

export function get_encoding(
  encoding: TiktokenEncoding = 'cl100k_base',
): MessageEncoder {
  if (encoders.has(encoding) === false) {
    encoders.set(encoding, create_message_encoder(encoding));
  }

  return encoders.get(encoding)!;
}
