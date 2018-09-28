let express = require('express');
let app = express();

let fs = require('fs');
let path = require('path');
let sanitizeHtml = require('sanitize-html');
let qs = require('querystring');
let template = require('./lib/template.js');


//Route, routing
app.get('/', (request, response) => fs.readdir('./data', function (error, filelist) {
  let title = 'Welcome';
  let description = 'Hello, Node.js';
  let list = template.list(filelist);
  let html = template.HTML(title, list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  response.send(html);
}))

//Create Module
app.get('/create', (request, response) => fs.readdir('./data', function (error, filelist) {
  let title = 'WEB - create';
  let list = template.list(filelist);
  let html = template.HTML(title, list, `
            <form action="/create_process" method="post">
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
}))

app.post('/create_process', function (request, response) {
  let body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    let post = qs.parse(body);
    let title = post.title;
    let description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
      response.writeHead(302, {
        Location: `/page/${title}`
      });
      response.end();
    })
  });
})

// Update Module
app.get('/update/:pageId', (request, response) => fs.readdir('./data', function (error, filelist) {
  let filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
    let title = request.params.pageId;
    let list = template.list(filelist);
    let html = template.HTML(title, list,
      `
              <form action="/update_process" method="post">
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
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`
    );
    response.send(html);
  });
}))

// Update Process Module
app.post('/update_process', function (request, response) {
  let body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    let post = qs.parse(body);
    let id = post.id;
    let title = post.title;
    let description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.redirect(`/page/${title}`);
      })
    });
  });
})

// Delete Process
app.post('/delete_process', function (request, response) {
  let body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    let post = qs.parse(body);
    let id = post.id;
    let filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
      response.redirect('/');
    })
  });
});

app.get('/page/:pageId', (request, response) =>
  fs.readdir('./data', function (error, filelist) {
    let filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
      let title = request.params.pageId;
      let sanitizedTitle = sanitizeHtml(title);
      let sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
      let list = template.list(filelist);
      let html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
                  <a href="/update/${sanitizedTitle}">update</a>
                  <form action="/delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}">
                    <input type="submit" value="delete">
                  </form>`
      );
      response.send(html);
    });
  }));

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