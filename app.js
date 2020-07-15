const http = require('http');
const fs = require('fs');
const url = require('url');
const ejs = require('ejs');
const ProductService = require('./ProductService.js');
let items;
ProductService.getProducts().then(value => {
  items = value;
});

function serveStatic (req, res, pathname) {
  res.statusCode = 200;
  let type;
  let path;
  if (pathname.endsWith('.css')) {
    console.log('serveCSS');
    type = 'text/css';
    path = pathname.slice(1);
  } else if (pathname.endsWith('.jpeg') || pathname.endsWith('.jpg') || pathname.endsWith('.jpg/')) {
    console.log('serveJPG');
    type = 'image/jpeg';
    path = pathname.slice(1);
  } else if (pathname.endsWith('.gif')) {
    console.log('serveGIF');
    type = 'image/gif';
    path = pathname.slice(1);
  } else if (pathname.endsWith('.png')) {
    console.log('servePNG');
    type = 'image/png';
    path = pathname.slice(1);
  } else if (pathname.endsWith('.tiff')) {
    console.log('serveTIFF');
    type = 'image/tiff';
    path = pathname.slice(1);
  }
  res.setHeader('Content-Type', type);

  /* if exist file */
  try {
    fs.readFile(path, function (err, data) {
      if (err) {
        console.log(err);
        throw new Error(err);
      }
      res.write(data);
      res.end(data, 'binary');
    });
  } catch (e) {
    console.log(e);
    serveNotFound(req, res, 404, 'Не найден файл css или изображения');
  }

}

function getHTML (pathName, scope, res, req) {
  try {
    let htmlStr;
    ejs.renderFile(pathName, scope, function (err, html) {
      if (err) {
        console.log('ERROR: ' + err);
        return false;
      }
      htmlStr = html.toString();

    });
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.write(htmlStr);
    res.end();
  } catch (e) {
    console.log(e);
    serveNotFound(req, res, 500, 'Ошибка сервера');
  }
}

function serveIndex (req, res, pathName) {
  console.log('serveIndex');

  const scope = {
    products: items
  };

  getHTML(pathName, scope, res, req);
}

async function serveProduct (req, res, path) {
  console.log('serveProduct');

  let arr = path.split('-');
  let key = arr[0].replace('/product/', '');
  let slug = arr[1];
  let data = await getProduct(key);
  if (data !== null) {
    if(slug !== data.slug){
      redirect(req, res, `/product/${key}-${data.slug}`);
      return;
    }
    try {
      const scope = {
        product: data
      };
      getHTML('views\\product.ejs', scope, res, req);
    } catch (e) {
      console.log(e);

    }
  } else {
    serveNotFound(req, res, 500, 'Не найден товар');
  }

}

async function getProduct (key) {
  return await ProductService.getProductByKey(Number.parseInt(key))
    .then(value => {
      console.log(value);
      return value;
    });
  //.catch(serveNotFound(req, res, 500, "Не найден товар"));
}

function serveNotFound (req, res, code, message) {
  if (!message) {
    message = 'Not found ' + code;
  }
  console.log('serveNotFound ' + code);
  res.writeHead(code, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.write(message);
  res.end();
}

function redirect (req, res, newURL) {
  console.log('redirect ' + newURL);
   res.writeHead(301, {
     Location: newURL,
    'Content-Type': 'text/html; charset=utf-8'
  });
   res.end();
}
http.createServer(function (request, response) {
  try {
    console.log('Request, url:', request.url);
    const parsedURL = url.parse(request.url, true);

    let path = parsedURL.pathname;
    console.log('Путь', path);

    if (path.startsWith('/img')) {
      serveStatic(request, response, path);
    } else if (path.startsWith('/css')) {
      serveStatic(request, response, path);
    } else if (path.startsWith('/product')) {
      serveProduct(request, response, path);
    } else if (path === '/') {
      serveIndex(request, response, 'views\\index.ejs');
    } else {
      serveNotFound(request, response, 404, 'Страница не найдена');
    }
  } catch (e) {
    console.log(e);
    serveNotFound(request, response, 500, 'Ошибка сервера');
  }
}).listen(8000, '127.0.0.1', function () {
  console.log('Сервер начал прослушивание запросов ');
});
