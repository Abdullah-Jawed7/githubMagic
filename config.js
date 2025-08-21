import {
  Runner,
  setTracingDisabled,
  OpenAIChatCompletionsModel,
} from '@openai/agents';
import OpenAI from 'openai';
import { API_KEY, BASE_URL, MODEL_NAME } from './env.js';

// Read environment variables
const baseURL = BASE_URL || '';
const apiKey = API_KEY ||'' ;
const modelName = MODEL_NAME || '';

if (!baseURL || !apiKey || !modelName) {
  throw new Error(
    'Please set BASE_URL, API_KEY, MODEL_NAME via env var or code.',
  );
}


const client = new OpenAI({ apiKey: apiKey, baseURL: baseURL });
setTracingDisabled(true);

class CustomModelProvider {
  async getModel(model) {
    return new OpenAIChatCompletionsModel(client, model || modelName);
  }
}

export const CUSTOM_MODEL_PROVIDER = new CustomModelProvider();
export const runner = new Runner({ modelProvider: CUSTOM_MODEL_PROVIDER });