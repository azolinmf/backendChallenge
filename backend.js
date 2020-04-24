// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');

//   if (req.url == '/oi') {
//     res.end('aaahh')
//   }
//   res.end('Hello, Wooooorld!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

// var express = require("express");
// var bodyParser = require("body-parser");
// var app  = express();
// const teste = "tesasdte";
// const _MS_PER_DAY  = 1000 * 60 * 60 * 24;
// const REGEX = /^(0[1-9]|[1-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])([12]\d{3})$/g;
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.listen(3000,function(){
//     console.log(`Server running at http://localhost:3000/`);
//   })

// app.post('/post',function(req,res){
//   res.send('post');
// });

// app.get('/diferenca/:data',function(req,res){
//       if (req.params.data == null) {
//         res.end(JSON.stringify({ 'erro': 'parametros invalidos' }));
//         return;
//       }
//       if (!req.params.data.match(REGEX)) {

//         res.end(JSON.stringify({ 'erro': 'parametros invalidos' }));
//         return;
//       }

//       let today = new Date();   
//       let dateDateobj = new Date(today.getFullYear(),today.getMonth()+1,today.getDate());
//       let requestReturn = req.params.data;
//       let dateRequestoBJ = new Date(requestReturn.substr(4),requestReturn.substr(2,2),requestReturn.substr(0,2));
//       let retorno = "";
//       if(dateDateobj.getTime() === dateRequestoBJ.getTime()) {
//         retorno = "Data de hoje"
//       }
//       else if (dateRequestoBJ.getTime() < dateDateobj.getTime()) {
//         retorno = "Data é antes de hoje, já se passaram "+  dateDiffInDays(dateRequestoBJ, dateDateobj); +" dias";
//       }
//       else if (dateRequestoBJ.getTime() > dateDateobj.getTime()) {
//         retorno = "Data é depois de hoje, faltam "+  Math.abs(dateDiffInDays(dateRequestoBJ, dateDateobj)) +" dias";
//       }
//       else {
//         retorno = "Algo deu errado"
//       }
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({  response : retorno }));
//       return;
// });

// function dateDiffInDays(a, b) {
//   const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
//   const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
//   return Math.floor((utc2 - utc1) / _MS_PER_DAY);
// }



const express = require('express')
const server = express() //Instancia um servidor
const PORT = process.env.PORT || 3000; // Define qual porta o servidor vai ouvir
const _MS_PER_DAY  = 1000 * 60 * 60 * 24;
const REGEX = /^(0[1-9]|[1-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])([12]\d{3})$/g;

server.listen(PORT, () => console.log(`Server running at http://localhost:3000/`));

server.get("/diferenca", (request, response) => {
        var reqDate = request.query.data
        var days = calcDateDiff(reqDate)

        if (reqDate == null) {
          response.json({ 'erro': 'parametros invalidos' });
          return;
        }
        if (!reqDate.match(REGEX)) {
          response.json({ 'erro': 'parametros invalidos' });
          return;
        }

        response.json({"dias": days});
} );


function calcDateDiff(dateString) {
    var day = dateString.substring(0, 2) 
    var month = dateString.substring(2, 4)
    var year = dateString.substring(4)

    var formattedDate = year + "-" + month + "-" + day // Formatamos a data para o padrao ISO, que o javascript usa
    var requestedDate = new Date(formattedDate) // Instanciamos um objeto com a data que foi pedida
    var today = new Date() // Instanciamos um objeto com a data de hoje

    var diffMilli = (requestedDate - today ) // Diferenca das datas em milissegundos
    var diffDays = parseInt( diffMilli/ (_MS_PER_DAY), 10);  // Diferenca das datas em dias

    return diffDays
}


// var express = require("express");
// var bodyParser = require("body-parser");
// var app  = express();
// const teste = "tesasdte";
// const _MS_PER_DAY  = 1000 * 60 * 60 * 24;
// const REGEX = /^(0[1-9]|[1-2][0-9]|31(?!(?:0[2469]|11))|30(?!02))(0[1-9]|1[0-2])([12]\d{3})$/g;
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.listen(3000,function(){
//     console.log(`Server running at http://localhost:3000/`);
//   })

// app.post('/post',function(req,res){
//   res.send('post');
// });

// app.get('/diferenca',function(req,res){
//       let entrada = req.query.data
//       res.json({ "dias": calculaTempo(entrada)});
// });

// function calculaTempo(entrada){
//   if (entrada == null) {return 'erro'}
//   if (entrada.match(REGEX)) {
//         let today = new Date();   
//         let dateDateobj = new Date(today.getFullYear(),today.getMonth()+1,today.getDate());
//         let requestReturn = entrada;
//         let dateRequestoBJ = new Date(requestReturn.substr(4),requestReturn.substr(2,2),requestReturn.substr(0,2));
//         let retorno = "";
//         if(dateDateobj.getTime() === dateRequestoBJ.getTime()) {
//           retorno = "Data de hoje"
//         }
//         else if (dateRequestoBJ.getTime() < dateDateobj.getTime()) {
//           retorno = "Data é antes de hoje, já se passaram "+  Math.abs(dateDiffInDays(dateRequestoBJ, dateDateobj)) +" dias";
//         }
//         else if (dateRequestoBJ.getTime() > dateDateobj.getTime()) {
//           retorno = "Data é depois de hoje, faltam "+  Math.abs(dateDiffInDays(dateRequestoBJ, dateDateobj)) +" dias";
//         }
//         else {
//           retorno = "Algo deu errado"
//         }
//         return retorno;
//   }
//   else{    
//      return 'erro';
//   }
// }
// function dateDiffInDays(a, b) {
//   const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
//   const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
//   return Math.floor((utc1 - utc2 ) / _MS_PER_DAY);
// }