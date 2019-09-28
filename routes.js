function routes(app, express) {
  app.use(express.static('public'));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
  });

  app.get('/:lobbyId', (req, res) => {
    res.sendFile('public/index.html', { root: __dirname });
  });
}

module.exports = routes;
