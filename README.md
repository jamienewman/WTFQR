#WTFQR#

##Installation##

You will need Node and NPM installed

Clone the repo down

<code>
git clone git@github.com:jamienewman/WTFQR.git

###Dependancies###

Run this to install dependencies:

<code>
cd WTFQR && npm install -d

This will bring in all the necessary stuff, if it fails, this is due to a dependency of node-canvas:

<code>
brew install cairo

###Running the app###

From the command line:

<code>
node wtfqr.js

and open your browser to

<a>
localhost:3000/race

If you are working with your phone to simulate the connection, you'll need to browse to your computer name before the QR code is generated and keep the phone and computer on the same network, i.e.:

<a>
jamienewman:3000/race