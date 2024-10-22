const http = require('http');
const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <type>', 'Server host')
  .requiredOption('-p, --port <type>', 'Server port')
  .requiredOption('-c, --cache <type>', 'Cache directory path');

program.parse(process.argv);

const options = program.opts();

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('/');
  const httpCode = urlParts[1];
  const filePath = path.join(options.cache, `${httpCode}.jpg`);

  if (req.method === 'GET') {
    try {
      await fs.access(filePath); // Перевіряємо доступність файлу
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (err) {
      console.error(`File not found: ${filePath}`); // Лог помилки
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: Image not found'); // Чітке повідомлення про помилку 404
    }
  } 
  else if (req.method === 'PUT') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(body);
      try {
        await fs.writeFile(filePath, buffer);
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Image saved');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error');
      }
    });
  } else if (req.method === 'DELETE') {
    try {
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Image deleted');
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`); // Лог помилки
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: Image not found'); // Чітке повідомлення про помилку 404
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
