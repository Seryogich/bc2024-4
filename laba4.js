const http = require('http');
const commander = require('commander');
const fs = require('fs').promises;
const path = require('path');
const program = new commander.Command();

program
  .requiredOption('-h, --host <type>', 'host address')
  .requiredOption('-p, --port <number>', 'port number')
  .requiredOption('-c, --cache <path>', 'cache directory');

// Виправлення тут: без дужок
program.parse(process.argv); 

const { host, port, cache } = program.opts();
if (!host || !port || !cache) {
  console.error('Error: All parameters --host, --port, and --cache are required.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.end('Proxy server is working');
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
