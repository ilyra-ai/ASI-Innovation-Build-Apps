# Dyad

Dyad is a local, open-source AI app builder. It's fast, private, and fully under your control — like Lovable, v0, or Bolt, but running right on your machine.

[![Image](https://github.com/user-attachments/assets/f6c83dfc-6ffd-4d32-93dd-4b9c46d17790)](http://dyad.sh/)

More info at: [http://dyad.sh/](http://dyad.sh/)

## 🚀 Features

- ⚡️ **Local**: Fast, private and no lock-in.
- 🛠 **Bring your own keys**: Use your own AI API keys — no vendor lock-in.
- 🖥️ **Cross-platform**: Easy to run on Mac or Windows.

## 📦 Download

No sign-up required. Just download and go.

### [👉 Download for your platform](https://www.dyad.sh/#download)

## 🤝 Community

Join our growing community of AI app builders on **Reddit**: [r/dyadbuilders](https://www.reddit.com/r/dyadbuilders/) - share your projects and get help from the community!

## 🐳 Docker

You can run the web renderer locally through Docker Compose. The development profile serves Vite directly, while the production profile builds the static site and serves it with Nginx.

```bash
# Development server on http://localhost:5173
docker compose --profile dev up --build

# Production build served on http://localhost:8080
docker compose --profile prod up --build
```

Override the exposed ports by exporting `DYAD_WEB_PORT` or `DYAD_PROD_PORT` before running the commands.

Run `scripts/docker-smoke-test.sh` to automate a basic availability check against either profile. Pass `dev` or `prod` to match the desired configuration.

=======

## 🛠️ Contributing

**Dyad** is open-source (Apache 2.0 licensed).

If you're interested in contributing to dyad, please read our [contributing](./CONTRIBUTING.md) doc.
