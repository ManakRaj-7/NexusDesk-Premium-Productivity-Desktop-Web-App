# NexusDesk

NexusDesk is a modern productivity workspace with notes, tasks, focus sessions, saved resources, settings, authentication, and a persistent AI assistant.

## Live Demo

**[NexusDesk Premium Productivity](https://nexus-desk-premium-productivity-des-umber.vercel.app/)**

## Features

- Dashboard with task summaries, streaks, and activity.
- Notes with folders, tags, markdown-style content, and favorites.
- Tasks with priority, status, due dates, and filtering.
- Focus mode with session tracking and productivity stats.
- Jobs, links, and file-style organization.
- Command palette and responsive app-style navigation.
- AI Assistant powered by **Gemini 3 Flash** through OpenRouter.

## AI Provider Architecture

The backend owns all AI provider calls so API keys never ship to the browser.

1. The React assistant page sends chat messages to `POST /api/assistant/chat`.
2. The Express controller loads the current conversation from MongoDB.
3. `server/src/services/aiProvider.js` builds an OpenAI-compatible chat payload.
4. OpenRouter receives the request at `https://openrouter.ai/api/v1/chat/completions`.
5. NexusDesk streams the OpenRouter response server-side, aggregates it, saves the assistant reply, and returns clean model metadata to the UI.

Required OpenRouter headers:

```http
Authorization: Bearer <OPENROUTER_API_KEY>
Content-Type: application/json
```

Optional but configured headers:

```http
HTTP-Referer: <your app URL>
X-Title: NexusDesk
```

## AI Models

Primary model:

```text
google/gemini-3-flash-preview
```

Fallback chain:

```text
google/gemini-3.1-flash-lite-preview
google/gemini-3.1-flash-lite
google/gemini-2.5-flash-lite
deepseek/deepseek-chat-v3-0324:free
meta-llama/llama-3.3-70b-instruct:free
mistralai/mistral-small-24b-instruct-2501:free
mistralai/mistral-small-3.2-24b-instruct
```

Notes:

- `Gemini 3 Flash` is displayed in the UI for the primary model.
- OpenRouter's live model catalog currently exposes `mistralai/mistral-small-3.2-24b-instruct` as the valid Mistral Small 3.2 ID, without the `:free` suffix.
- `mistralai/mistral-small-24b-instruct-2501:free` is included as the free Mistral fallback.
- Legacy Flash model settings are normalized to `google/gemini-3-flash-preview`.

## OpenRouter Setup

1. Create an OpenRouter account.
2. Create an API key from the OpenRouter dashboard.
3. Add the key to `server/.env`.
4. Set your deployed frontend URL in `CLIENT_URL` and `OPENROUTER_HTTP_REFERER`.
5. Restart the server after changing environment variables.

## Environment Variables

Example `server/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/nexusdesk

JWT_SECRET=change_this_jwt_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLIENT_URL=http://localhost:5173
API_VERSION=v1

OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key
OPENROUTER_MODEL=google/gemini-3-flash-preview
OPENROUTER_FALLBACK_MODELS=google/gemini-3.1-flash-lite-preview,google/gemini-3.1-flash-lite,google/gemini-2.5-flash-lite,deepseek/deepseek-chat-v3-0324:free,meta-llama/llama-3.3-70b-instruct:free,mistralai/mistral-small-24b-instruct-2501:free,mistralai/mistral-small-3.2-24b-instruct
OPENROUTER_HTTP_REFERER=http://localhost:5173
OPENROUTER_APP_TITLE=NexusDesk
AI_STREAMING=true
AI_REQUEST_TIMEOUT_MS=20000
AI_MAX_TOKENS=700
AI_TEMPERATURE=0.35
```

Example `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

## Fallback Behavior

NexusDesk tries each model once, in order. It preserves the same system message, recent conversation history, and latest user prompt for every fallback attempt.

Fallback activates for provider errors such as:

- Rate limits.
- Timeout responses.
- Empty responses.
- Model unavailable errors.
- Malformed provider responses.
- Temporary OpenRouter or upstream provider errors.

Fallback stops early for invalid or unauthorized API keys because another model cannot fix a bad key.

The UI shows the active fallback model after a fallback succeeds and shows a friendly error when every model fails.

## Troubleshooting AI

**Invalid API key**

Check `OPENROUTER_API_KEY` on the server. It must be sent as `Authorization: Bearer <key>`.

**Rate limited**

OpenRouter free models can have strict limits. NexusDesk will try the next fallback automatically. Retry later if the whole chain is rate limited.

**Model unavailable**

OpenRouter model IDs change over time. Check the live model catalog at `https://openrouter.ai/api/v1/models` and update `OPENROUTER_FALLBACK_MODELS`.

**Timeouts**

Lower `AI_MAX_TOKENS`, shorten the prompt, or increase `AI_REQUEST_TIMEOUT_MS`.

**Empty responses**

Retry or rephrase. Some upstream providers can return empty completions for filtered or overloaded requests.

**Browser shows a generic error**

Check the server logs. Provider attempts are logged with the failed model and reason.

## Local Development

Install and run the server:

```bash
cd server
npm install
npm run dev
```

Install and run the client:

```bash
cd client
npm install
npm run dev
```

Build the client for production:

```bash
cd client
npm run build
```

## Deployment

- Frontend: Vercel or any static host that supports React SPA fallback.
- Backend: Render, Railway, Fly.io, or another Node.js host.
- Database: MongoDB Atlas or a compatible MongoDB deployment.

Set server environment variables on the backend host, and set `VITE_API_URL` on the frontend host.

## Demo

Live app:

```text
https://nexus-desk-premium-productivity-des-umber.vercel.app/
```

Demo credentials:

```text
Email: demo@nexusdesk.com
Password: DemoPass123
```

## License

MIT
