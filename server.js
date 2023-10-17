
// the variable http is assigned an instance of the HTTP module. This is what imports the HTTP module and allows me to use its function createServer().
const http = require('http'), fs = require('fs'), url = require('url');

// the createServer() function is called on the new http variable. Within this function is another function that has two arguments request and response. This function will be called every time an HTTP request is made against that server. It is called request handler.
http.createServer((request, response) => {

    // extracts the url property from the request object. assigns it to variable. request.url only available in the http module. Only the path part is included in request.url.
    let addr = request.url;
    console.log('addr: ' + addr);

    // generates a clean, robust URL. In q the parsed URL from the user is stored.
    let q = new URL(addr, 'http://' + request.headers.host);
    let filePath = '';

    // Append the URL and a timestamp to the log file
    // appendFile() takes 3 arguments: the file, the new info to be added, an error-handling function
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);

        } else {
            console.log('Added to log.');
        }
    });

    // if the pathname inclues 'documentation' the filepath ist set do the documentation.html page
    if (q.pathname.includes('documentation')) {
        // ensuring that the file path is complete and accurate
        // __dirname is a modul-specific variable. It provides the path to the current directory.
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }


    // the readFile function of the filesystem module reads the content of the file. The function returns the content of the file as data - not the file itself!
    fs.readFile(filePath, (err, data) => {
        // if there is a problem locating or reading the file the function throws an exception. The program terminates.
        if (err) {
            throw err;
        }

        // tells the server to add a header to the response it sends back along with the HTTP code "200". The content-type shows that html is going to be sent.
        response.writeHead(200, { 'Content-Type': 'text/html' });
        // the read data is written into the response
        response.write(data);
        // ends the response and sends back a message
        // signals the server that all of the response headers and body have been sent
        response.end();

    });

    // the server listens on port 8080
}).listen(8080);


console.log('My test server is running on Port 8080.');