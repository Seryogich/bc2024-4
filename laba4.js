const http = require('http');
const commander = require('commander');
const fs = require('fs').promises;
const path = require('path');
const program = new commander.Command();

program
  .requiredOption('-h, --host <type>', 'host address')
  .requiredOption('-p, --port <number>', 'port number')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);
const { host, port, cache } = program.opts();
if (!host || !port || !cache) {
  console.error('Error: All parameters --host, --port, and --cache are required.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.slice(1);
  const filePath = path.join(cache, urlPath + '.jpg'); 
  if (req.method === 'PUT') {
    const chunks = [];
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      try {
        await fs.writeFile(filePath, buffer);
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Image created');
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error saving image');
      }
    });
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
