export default function(app) {
  if (app.get('isDev') && app.get('standalone')) {
    app.get('/dev-login/:id', (req, res) => {
      const id = req.params.id;
      app.models.AccessToken.findById(id, (err, accessToken) => {
        console.log('Dev-login with id ', id, err, accessToken);
        res.cookie('accessToken', JSON.stringify(accessToken));
        res.redirect('/');
      });
    });
  }
}
