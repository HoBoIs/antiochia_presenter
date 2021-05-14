# antiochia-presenter

## Preparing the environment

1. To use this package, you will need to have **NodeJS** and **npm** installed
from [https://nodejs.org](https://nodejs.org).
2. After that download the dependencies using: `npm install`

## Setting up

The application comes pre-packaged with some example material, which should be
extended and replaced with the desired content.

### Songs

You can add, modify or remove songs by placing them in the `src/server/songs`
folder, or editing / deleting an existing one.

### Talks

The talks are managed through the `src/server/talks.json` file.  
The music files should be put into the `src/server/music` folder, while the
images belong in their respective `src/server/images` directory.

## Running the application

If all the dependencies were successfully downloaded, the program can be started
by issuing the following command: `npm start`

It will create a window that can be dragged to the desired screen and made
fullscreen by pressing the **F11** key.

If the server has been successfully started in the background, the remote
interface can be accessed by opening a browser and navigating to the ip address
of the host computer. 
(For testing purposes visiting [localhost](http://localhost/) from the same
machine works as well.)

[If the page is inaccessible from other devices, make sure that the firewall
rules allow the application to communicate on the network!]

## Modifying the source

- If you would prefer to start the window in fullscreen mode by default, you
should look at lines _41 - 45_ of `src/server/main.js`

- If you would like to personalize the background of the lyrics, lines _44 - 48_
in `src/server/index.html` can help with that.

- If you would like to modify the client software, you need to have **Elm**
(0.18) installed. After editing the `src/client/Main.elm` file, you can build
it with the `npm run make-client` command.
