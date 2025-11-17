# 🛠️ VS Code Setup Guide

This guide will help you set up your development environment for the Person 5 Orchestrator project.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **VS Code** (latest version)
- **Git**

## 📦 Install Dependencies

```bash
cd person5-orchestrator
npm install
```

## 🔌 Recommended VS Code Extensions

Install these extensions for the best development experience:

### Essential
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** - Code linting
- **Prettier - Code formatter** - Code formatting

### Helpful
- **Auto Rename Tag** - Rename paired tags
- **Path Intellisense** - File path autocomplete
- **GitLens** - Enhanced Git features
- **GitHub Copilot** - AI pair programmer

## ⚙️ VS Code Settings

Create or update `.vscode/settings.json` in the project root:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🌍 Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your API keys and configuration

## 🚀 Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔍 Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🎨 Tailwind CSS

Tailwind is configured and ready to use. Refer to `tailwind.config.js` for customization.

## 📝 TypeScript

TypeScript is configured in `tsconfig.json`. The project uses strict mode for better type safety.

## 🔥 Hot Tips

- Use `Ctrl+Space` for IntelliSense
- Use `F12` to go to definition
- Use `Shift+F12` to find all references
- Use `Ctrl+P` for quick file navigation
- Use `Ctrl+Shift+P` for command palette

## 🐛 Troubleshooting

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run type-check
```

### Port already in use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

---

**Setup complete?** Head to `README.md` for project documentation! 🎉
