var express = require('express');
var router = express.Router();
let template = require('../lib/template.js');

// Main Page Routing
router.get('/', (request, response) => {
    let title = 'Welcome';
    let description = 'Hello, Node.js';
    let list = template.list(request.list);
    let html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
      <img src="/images/coding.jpg" style="width:300px; display:block; margin-top:10px;" />
      `,
        `<a href="/topic/create">create</a>`
    );
    response.send(html);
});

module.exports = router;