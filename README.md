# Super Duper Chat

As part of our course on NodeJS, we will be making a real-time chat application.

## Analysis of the chosen subject

The application will be a real-time chat. The following features will be part of it :

- Platform agnostic (no dependencies apart from NodeJS)
- Real time
- Unlimited simultaneous users and channels
- Persistent storage
- Chat features : user mentions, commands, search (users, channels and messages)

## Conception

Each feature will be implemented with a specific technology:

- Platform agnostic : we will use Docker to facilitate deployment on any platform
- Real time : We will use websockets
- Unlimited users and channels : the only limit will be the capacity of the container as it is only a memory and CPU problem.
    We will try to optimise as much as possible the application though.
- Persistent storage: we will use SQLite. The reason for this is to facilitate importation and exportation of data, and Docker use. The database file will be stored on the container's host.

The backend will be pure NodeJS using Express as web server, and Socket.IO as websocket server
The frontend will be made using Bootstrap. Handlebars will be used as a templating engine.

## Roadmap

- 10/10/2018 : this document
- 10/10/2018 : creation of boilerplate code
- 15/10/2018 to 11/11/2018 : implementation and tests
- 12/11/2018 : Deadline

## MVP features :

- Platform agnostic (no dependencies apart from NodeJS)
- Real time
- Unlimited simultaneous users and channels
