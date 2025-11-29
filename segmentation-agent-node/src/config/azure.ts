import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import dotenv from 'dotenv';

dotenv.config();

let client: OpenAIClient | null = null;
let deploymentName: string = 'gpt-4';

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;

if (endpoint && apiKey) {
  try {
    client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    console.log('✅ Azure OpenAI client initialized');
  } catch (error) {
    console.warn('⚠️  Azure OpenAI initialization failed:', error);
  }
} else {
  console.warn('⚠️  Azure OpenAI credentials not provided - AI features disabled');
}

export { client, deploymentName };
export const isAIEnabled = () => client !== null;
