var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
app.use(bodyParser.json({type:'application/json'}));
app.use(bodyParser.urlencoded({extended:true}));

//Conexao
var con = mysql.createConnection({
    host :'localhost',
    port:'8889',
    user:'root',
    password:'root',
    database:'backend',
    multipleStatements: true
});
//Configuração Porta
var server = app.listen(4548,function(){
    var host = server.address().address
    var port = server.address().port
    console.log("start on http://localhost:4548/");
});
//Conexão
con.connect(function(error){
    if(error) console.log(error);
    else console.log("connected");
});

//mostra todas as reflections
app.get('/listaReflection',function(req,res){
    try {
        con.query("SELECT * FROM reflection",function (error,rows,fields) {
            if (rows.length == 0){
                res.send('Sem reflections');
            }
            else {
                if(error) {
                    console.log(error);
                    res.send('error');
                } 
                else {
                    console.log(rows);
                    res.send(rows);
                }
            }
        });
        } catch (error) {
            console.log('There has been a problem with your fetch operation: ' + error.message);
        }

});

//buscar reflection por id
app.get('/reflection',function(req,res){
    // se for publico blz
    // se for privado a gente ve sharedWith, comparar idUsuario com idsNomesSharedWith, 
    // se estiver libera, senao da mensagem de erro

    let idReflection = req.query.id
    let idUsuario = req.query.idUser
    let visibility = 0
    let usuariosQuePossuemReflection = []
    try {
        con.query("SELECT `visibility` FROM `reflection` WHERE `id`='"+idReflection+"'",function (error,rows,fields) {
            if(rows.length == 0){
                res.json({"erro":"Reflection não existe"});
            }
            else{
                if(error){
                    res.json({"erro":"erro"});
                } 
                else{
                    visibility = rows[0]
                    visibility = visibility["visibility"]
                    if(visibility == 1){
                        //publico
                        con.query("SELECT * FROM reflection WHERE `id` = '"+idReflection+"' ",function (error,rows,fields) {
                            if(rows.length == 0){
                                res.send('Sem resposta (Database Vazia)');
                            }
                            else{
                                if(error){
                                    res.send('error');
                                } 
                                else{
                                    res.json({"success":rows});
                                }
                            }
                        });
                    }
                    else{
                        //privado
                        con.query("SELECT `idUsers` FROM `relacaoUsersReflection` WHERE `idReflection`='"+idReflection+"'",function (error,rows,fields) {
                            if(rows.length == 0){
                                res.json({"Erro":"Usuarios nao existem"});
                            }
                            else{
                                if(error){
                                    res.json({"Erro":"erro"});
                                } 
                                else{
                                    
                                    rows.forEach(function(element){
                                        usuariosQuePossuemReflection.push(parseInt(element["idUsers"]))
                                    })
                                    //lista de usuario que possuem a reflection usuariosQuePossuemReflection sharedWith
                                    console.log(usuariosQuePossuemReflection)
                                    if(usuariosQuePossuemReflection.includes(parseInt(idUsuario))){
                                        
                                        con.query("SELECT * FROM reflection WHERE `id` = '"+idReflection+"'",function (error,rows,fields) {
                                            if(rows.length == 0){
                                                res.send('Sem resposta (Database Vazia)');
                                            }
                                            else{
                                                if(error){
                                                    res.send('error');
                                                } 
                                                else{
                                                    res.send(rows);
                                                }
                                            }
                                        });


                                    }
                                    else{
                                       res.json({"Erro":"você não pode ler essa reflection"})
                                    }
                                }
                            }
                        })
                    }
                }
                    
            }
        });
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});

//adicionar reflection
// app.post('/insertReflection',function(req,res){
//     let text = req.body.text;
//     let creationTime = req.body.creationTime;
//     let visibility = req.body.visibility
//     let belongsTo = req.body.belongsTo
//     try {
//         con.query("INSERT INTO reflection(text, creationTime, belongsTo, visibility) VALUES ('"+text+"','"+creationTime+"','"+belongsTo+"','"+visibility+"')",function (error,rows,fields) {
//             if(error){
//                 console.log(error);
//                 res.send(error);
//             }
//             else{
//                 console.log(rows);
//                 res.send('success');
//             }
//         });
//     } catch (error) {
//         console.log('There has been a problem with your fetch operation: ' + error.message);
//     } 
// });

app.get('/getID/:username',function(req,res){
    let username = req.params.username
    let idsPeloNome = []
    try{
        con.query("SELECT id FROM users WHERE username = '"+username+"'",function (error,rows,fields) {
            if(error){
                console.log(error);
                res.json({'error':error})
            }
            else{
                rows.forEach(function(element){
                    idsPeloNome.push(element["id"]);
                });
                res.json({"idUser":idsPeloNome});
            }
        });
    }
    catch(error){
        console.log(error)
    }
});


app.post('/insertReflection',function(req,res){
    let text = req.body.text;
    let creationTime = req.body.creationTime;
    let visibility = req.body.visibility;
    let belongsTo = req.body.belongsTo;
    let sharedWith = req.body.sharedWith
    let idsPeloNome = []
    let ultimaIDReflection = 0
        try{
            con.query("SELECT `id` FROM `users` WHERE `username` IN ("+String(sharedWith.split(','))+")",function (error,rows,fields) {
                if(error){
                    console.log(error);
                    res.json({'error':error})
                }
                else{
                    rows.forEach(function(element){
                        idsPeloNome.push(element["id"]);
                    });
                    con.query("INSERT INTO `reflection`(`text`, `creationTime`, `visibility`, `belongsTo`) VALUES ('"+text+"','"+creationTime+"','"+visibility+"','"+belongsTo+"');SELECT `id` AS LastID FROM `reflection` WHERE `id` = @@Identity;",function (error,rows,fields) {
                        if(error){
                            res.json({'error':error})
                        }
                        else{
                            rows[1].forEach(function(element){
                                ultimaIDReflection = parseInt(element["LastID"]);
                            });
                            var stringSaida = ""
                            idsPeloNome.forEach(function(element){
                                stringSaida += "('"+element+"'"+",'"+ultimaIDReflection+"')"
                                if(idsPeloNome.indexOf(element) != idsPeloNome.length - 1){
                                    stringSaida += ","
                                }
                            })    
                            console.log("saida = "+stringSaida)
                            con.query("INSERT INTO `relacaoUsersReflection`(`idUsers`, `idReflection`) VALUES "+stringSaida,function (error,rows,fields) {
                                if(error){
                                    
                                    res.json({'error':error})
                                }
                                else{
                                    con.query("INSERT INTO `relacaoUsersReflection`(`idUsers`, `idReflection`) VALUES  ('"+belongsTo+"','"+ultimaIDReflection+"') ",function (error,rows,fields) {
                                        if(error){
                                            res.json({'error':error})
                                        }
                                        else{
                                        res.json({'success':rows})
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        catch(error){
            console.log(error)
        }
    
});

//para usar:
//localhost:4548/updateText
app.put('/updateText', function (req, res) {
    let texto = req.body.texto
    let idUser = req.body.idUser
    let idReflection = req.body.idreflection

    try{
        con.query("SELECT belongsTo FROM reflection WHERE id = '"+idReflection+"'",function (error,rows,fields) {
            if(rows.length == 0){
                res.send('Sem resposta (Database Vazia)');
            }
            else{
                console.log(rows);
                rows.forEach(function(element){
                    belongsTo = parseInt(element["belongsTo"])
                })

                if(belongsTo == parseInt(idUser)){
                    //aqui
                    con.query("UPDATE reflection SET text='"+texto+"' WHERE id = '"+idReflection+"'",function (error,rows,fields){
                        if(error){
                            res.json({"error":"erro"});
                        }
                        else{
                            res.send(rows);
                        }
                    });
                }
                else{
                    console.log('nao é dono')
                    res.json({"erro":"Você não é o dono da reflection"})
                }
            }
        });
    }catch{
        res.json({"error ": error.message});
    }

});

app.put('/updateVisibility', function (req, res) {
    let visibility = req.body.visibility
    let idUser = req.body.idUser
    let idReflection = req.body.idreflection
    try{
        con.query("SELECT belongsTo FROM reflection WHERE id = '"+idReflection+"'",function (error,rows,fields) {
            if(rows.length == 0){
                res.send('Sem resposta (Database Vazia)');
            }
            else{
                console.log(rows);
                rows.forEach(function(element){
                    belongsTo = parseInt(element["belongsTo"])
                })
                if(belongsTo == parseInt(idUser)){
                    con.query("UPDATE reflection SET visibility='"+visibility+"' WHERE id = '"+idReflection+"'",function (error,rows,fields){
                        if(error){
                            res.json({"error":"erro"});
                        }
                        else{
                            res.send(rows);
                        }
                    });
                }
                else{
                    console.log('nao é dono')
                    res.json({"erro":"Você não é o dono da reflection"})
                }
            }
        });
    }catch{
        res.json({"error ": error.message});
    }

});


function formatar(date){
    //10042020
    var day = date.substring(0, 2) ;
    var month = date.substring(2, 4);
    var year = date.substring(4);
    return year + "-" + month + "-" + day;
}

//para usar:
//http://localhost:4548/reflection?from=12122012&to=16042020
//ler reflection  por data
app.get('/reflectionData',function(req,res){
    let from = req.query.from
    let to = req.query.to
    from = formatar(from);
    to = formatar(to);

    try {
        con.query("SELECT * FROM reflection WHERE creationTime BETWEEN '"+from+"' AND '"+to+"'",function (error,rows,fields) {
            if(rows.length == 0){
                res.send({"erro":'Sem resposta'});
            }
            else{
                if(error){
                    res.json({"erro":"erro"});
                } 
                else{
                    res.send(rows);
                }
            }
        });
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});


app.post('/cadastro',function(req,res){
    let username = req.body.username
    let name = req.body.name
    let password = req.body.password 
    try{
        con.query("SELECT * FROM users WHERE username = '"+username+"' ",function (error,rows,fields) {
            if(rows.length == 0){
                con.query("INSERT INTO users(username, password, name, statusLogado) VALUES ('"+username+"','"+password+"','"+name+"','1')",function (error,rows,fields) {
                    if(error){
                        res.json({"erro":error});
                    }
                    else{
                        res.json({"Success":"Usuario cadastrado."});
                    }
                });
            }
            else{
                res.json({"erro":"Usuario já exite ou aconteceu algum erro."});
            }
        });
    } catch (error) {
       console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});

app.post('/login',function(req,res){
    let username = req.body.username
    let password = req.body.password 
    try{
        con.query("SELECT `username`, `password` FROM `users` WHERE `username`='"+username+"' AND `password`='"+password+"' AND `statusLogado`='0'",function (error,rows,fields) {
            if(rows.length != 0){
                con.query("UPDATE `users` SET `statusLogado`='1'  WHERE `username`='"+username+"' AND `password`='"+password+"'",function (error,rows,fields) {
                    if(error){
                        res.json({"erro":error});
                    }
                    else{
                        res.json({"Success":"Usuario logado"});
                    }
                });
            }
            else{
                res.json({"erro":error});

            }
        });
    } catch (error) {
       console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});

app.post('/deslogar',function(req,res){
    let username = req.body.username
    let password = req.body.password 
    try{
        con.query("SELECT `username`, `password` FROM `users` WHERE `username`='"+username+"' AND `password`='"+password+"' AND `statusLogado`='1'",function (error,rows,fields) {
            if(rows.length != 0){
                con.query("UPDATE `users` SET `statusLogado`='0'  WHERE `username`='"+username+"' AND `password`='"+password+"'",function (error,rows,fields) {
                    if(error){
                        res.json({"erro":error});
                    }
                    else{
                        res.json({"Success":"Usuario deslogado"});
                    }
                });
            }
            else{
                res.json({"erro":error});

            }
        });
    } catch (error) {
       console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});


//deletar reflection por id
app.delete('/delete',function(req,res){
    let idReflection = req.body.idReflection
    let idUser = req.body.idUser
    let belongsTo = 0
    //ver se usuario é dono da reflection
    //deletar reflection da tabela reflection
    //deletar reflection da tabela relacao
    //SELECT `belongsTo` FROM `reflection` WHERE `id` = '3'
    try {
        con.query("SELECT `belongsTo` FROM `reflection` WHERE `id` = '"+idReflection+"'",function (error,rows,fields) {
            if(rows.length == 0){
                res.send('Sem resposta (Database Vazia)');
            }
            else{
                console.log(rows);
                rows.forEach(function(element){
                    belongsTo = parseInt(element["belongsTo"])
                })
                if(belongsTo == parseInt(idUser)){
                    con.query("DELETE  FROM reflection WHERE `id` = '"+idReflection+"' ",function (error,rows,fields) {
                            if(rows.length == 0){
                                res.send('Erro)');
                            }
                            else{
                                //aqui
                                con.query("DELETE FROM `relacaoUsersReflection` WHERE `idReflection` = '"+idReflection+"'",function (error,rows,fields) {
                                    if(rows.length == 0){
                                        res.send('Sem resposta (Database Vazia)');
                                    }
                                    else{
                                        res.json({"success":rows})
                                    }
                                });
                            }
                    });
                }               
                else{
                    console.log('nao é dono')
                    res.json({"erro":"Você não é o dono da reflection"})
                }
            }
        });
    } catch (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
    } 
});


