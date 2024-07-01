// const { createServer } = require('https');
// const { readFileSync } = require('fs');
// const { parse } = require('url');
// const next = require('next');

// const hostname = 'buy.drinkmiron.net';
// const port = 3000;

// const httpsOptions = {
//   cert: readFileSync('./ssl/buy_drinkmiron_net.crt'),
//   ca: readFileSync('./ssl/buy_drinkmiron_net.ca-bundle'),
//   key: readFileSync('./ssl/buy_drinkmiron_net.p7b'),
// };

// const app = next({
//   dev: true, // Set to false in production
// });

// const server = createServer(httpsOptions, (req, res) => {
//   const parsedUrl = parse(req.url, true);
//   const { pathname, query } = parsedUrl;

//   if (pathname === '/_next/healthz') {
//     res.writeHead(200);
//     res.end('ok');
//   } else {
//     app(req, res);
//   }
// });

// server.listen(port, hostname, () => {
//   console.log(`Server started on https://${hostname}:${port}`);
// });
const next = require('next')

// note the "https" not "http" required module. You will get an error if trying to connect with https
const https = require('https')
const { parse } = require("url");

const fs = require("fs");

const hostname = 'buy.drinkmiron.net'
const port = 3000
const dev = process.env.NODE_ENV !== 'production'
  
const app = next({dev, hostname, port });

const sslOptions = {
    key: fs.readFileSync("./ssl/buy_drinkmiron_net.key"),
    cert: fs.readFileSync("./ssl/buy_drinkmiron_net.crt"),
    ca: fs.readFileSync('./ssl/buy_drinkmiron_net.ca-bundle')
}

const handle = app.getRequestHandler()

app.prepare().then(() => {
 const server = https.createServer(sslOptions, (req, res) => {

    // custom api middleware
    if (req.url.startsWith('/api')) {
    
      return handle(req, res);
    } else {
      // Handle Next.js routes
      return handle(req, res);
    }
 })
 server.listen(port, (err) => {
   if (err) throw err
   console.log('> Ready on https://buy.drinkmiron.net:' + port);
 })
})