## About this project

This project is a 24h/24h responsive TWITCH game that can be played for free on my twitch channel.
It is an autoclicker where you can add to the massive number of clicks from all players and get
rewards that will allow you to outperform your opponents, or get you closer to common global goals!

This project is mainly used to learn web hosting on a [Rezel](https://rezel.net/) container (MERCI!).
You can access the app SECURELY using https both on frontend serving and websocket communication, 
my reverse proxy handles the rest.

![Project Image](/IMAGES/SS_1.png)

## Pipeline

- FRONTEND: React, Socket.io client, typescript
- BACKEND: typescript, express, Socket.io server, twitch_IRC, communication with PostgreSQL DB
- Node.js for both

## Hosting

- Caddy 2 proxy and reverse proxy
- SSL secure certification for https connection

Go to my project [HERE](https://www.008032025.xyz).