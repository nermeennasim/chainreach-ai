# 🤖 AI Segmentation Setup Guide

## Option 1: Azure OpenAI (Recommended for Enterprise)

### Step 1: Create Azure OpenAI Resource

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Resource** → Search for "Azure OpenAI"
3. **Fill in details:**
   - Subscription: Your subscription
   - Resource Group: `chainreach-ai`
   - Region: `East US` (best availability)
   - Name: `chainreach-openai`
   - Pricing: `Standard`

4. **Deploy a Model:**
   - Go to your Azure OpenAI resource
   - Click "Model deployments" → "Create"
   - Model: `gpt-4` or `gpt-35-turbo`
   - Deployment name: `gpt-4-deployment`

5. **Get Credentials:**
   - Go to "Keys and Endpoint"
   - Copy `KEY 1` and `Endpoint`

### Step 2: Configure .env

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://chainreach-openai.openai.azure.com/
AZURE_OPENAI_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4-deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

---

## Option 2: OpenAI Direct (Faster Setup)

If you don't have Azure OpenAI yet, use OpenAI directly:

### Step 1: Get OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key

### Step 2: We'll create a quick adapter

---

## Quick Start: Using OpenAI (No Azure Account Needed)

I'll create a version that works with standard OpenAI API right now.
