let express = require('express');
let app = express();

let fs = require('fs');
let path = require('path');
let sanitizeHtml = require('sanitize-html');
let qs = require('querystring');
let bodyParser = require('body-parser');
let template = require('./lib/template.js');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Create Middleware
app.get('*', function (request, response, next) {
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  })
});

// Main Page Routing
app.get('/', (request, response) => {
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

// Create Module
app.get('/topic/create', (request, response) => {
  let title = 'WEB - create';
  let list = template.list(request.list);
  let html = template.HTML(title, list, `
            <form action="/topic/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
  response.send(html);
});

// Create Process Module
app.post('/topic/create_process', function (request, response) {
  let post = request.body;
  let title = post.title;
  let description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    response.redirect(`/topic/${title}`)
  })
})

// Update Module
app.get('/topic/update/:pageId', (request, response) => {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    let title = request.params.pageId;
    let list = template.list(request.list);
    let html = template.HTML(title, list,
      `
              <form action="/topic/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
    );
    response.send(html);
  });
});

// Update Process Module
app.post('/topic/update_process', function (request, response) {
  let post = request.body;
  let id = post.id;
  let title = post.title;
  let description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      response.redirect(`/topic/${title}`);
    })
  });
});

// Delete Process Module
app.post('/topic/delete_process', function (request, response) {
  let post = request.body;
  let id = post.id;
  let filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect('/');
  })
});

// Item Page Routing
app.get('/topic/:pageId', (request, response, next) => {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    if (err) {
      next(err);
    } else {
      let title = request.params.pageId;
      let sanitizedTitle = sanitizeHtml(title);
      let sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      let list = template.list(request.list);
      let html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/topic/create">create</a>
                  <a href="/topic/update/${sanitizedTitle}">update</a>
                  <form action="/topic/delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="delete">
                  </form>`
      );
      response.send(html);
    }
  });
});








// Handle 404 Error
app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Server Port
app.listen(3000, () => console.log('Example app listening on port 3000!'))


// let http = require('http');
// let fs = require('fs');
// let url = require('url');

// let template = require('./lib/template.js');
// let path = require('path');


// let app = http.createServer(function(request,response){
//     let _url = request.url;
//     let queryData = url.parse(_url, true).query;
//     let pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       if(queryData.id === undefined){
//       } else {
//         fs.readdir('./data', function(error, filelist){
//           let filteredId = path.parse(queryData.id).base;
//           fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//             let title = queryData.id;
//             let sanitizedTitle = sanitizeHtml(title);
//             let sanitizedDescription = sanitizeHtml(description, {
//               allowedTags:['h1']
//             });
//             let list = template.list(filelist);
//             let html = template.HTML(sanitizedTitle, list,
//               `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
//               ` <a href="/create">create</a>
//                 <a href="/update?id=${sanitizedTitle}">update</a>
//                 <form action="delete_process" method="post">
//                   <input type="hidden" name="id" value="${sanitizedTitle}">
//                   <input type="submit" value="delete">
//                 </form>`
//             );
//             response.writeHead(200);
//             response.end(html);
//           });
//         });
//       }
//     } else if(pathname === '/create'){
//       fs.readdir('./data', function(error, filelist){
//         let title = 'WEB - create';
//         let list = template.list(filelist);
//         let html = template.HTML(title, list, `
//           <form action="/create_process" method="post">
//             <p><input type="text" name="title" placeholder="title"></p>
//             <p>
//               <textarea name="description" placeholder="description"></textarea>
//             </p>
//             <p>
//               <input type="submit">
//             </p>
//           </form>
//         `, '');
//         response.writeHead(200);
//         response.end(html);
//       });
//     } else if(pathname === '/create_process'){
//       
//     } else if(pathname === '/update'){
//       fs.readdir('./data', function(error, filelist){
//         let filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//           let title = queryData.id;
//           let list = template.list(filelist);
//           let html = template.HTML(title, list,
//             `
//             <form action="/update_process" method="post">
//               <input type="hidden" name="id" value="${title}">
//               <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//               <p>
//                 <textarea name="description" placeholder="description">${description}</textarea>
//               </p>
//               <p>
//                 <input type="submit">
//               </p>
//             </form>
//             `,
//             `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
//           );
//           response.writeHead(200);
//           response.end(html);
//         });
//       });
//     } else if(pathname === '/update_process'){
//       let body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           let post = qs.parse(body);
//           let id = post.id;
//           let title = post.title;
//           let description = post.description;
//           fs.rename(`data/${id}`, `data/${title}`, function(error){
//             fs.writeFile(`data/${title}`, description, 'utf8', function(err){
//               response.writeHead(302, {Location: `/?id=${title}`});
//               response.end();
//             })
//           });
//       });
//     } else if(pathname === '/delete_process'){
//       let body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           let post = qs.parse(body);
//           let id = post.id;
//           let filteredId = path.parse(id).base;
//           fs.unlink(`data/${filteredId}`, function(error){
//             response.writeHead(302, {Location: `/`});
//             response.end();
//           })
//       });
//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);