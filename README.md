# xoxo-nextjs-nakama

A simple Tic-Tac-Toe/xoxo multiplayer online game build with nextjs / react + nakama

- nextjs

# tutorial

## nakama

Nakama Client Side Tutorial (js)
https://www.youtube.com/watch?v=nbvVNmwjOrA

Nakama Server Runtime Code Project Setup using TypeScript
https://www.youtube.com/watch?v=FXguREV6Zf8

related document: https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/

# Usage

## client

template from https://github.com/shadcn-ui/next-template

```
pnpm install
pnpm run dev
```

## server

template from https://github.com/heroiclabs/nakama-project-template

```
# if you want to yarn or pnpm, you should also change Dockerfile
cd server && npm install
cd server && docker-compose up
```

### port

- "7349": gRPC API server
- "7350": HTTP API server
- "7351": http://127.0.0.1:7351 : nakama console (web ui)
  - username and password can set in `/data/my-config.yml`
