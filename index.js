//abrir o express e inicializá-lo
var express = require("express");
var app = express();

//transformar todos os bodies em json
app.use(express.json());

//abrir a porta
var port = 3000;

//SQL
var mysql = require('mysql');

//conectar o SQL
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "gelados globo"
});

//Verificar que o sql está conectado
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
});

/*Criação das Tabelas em SQL
CREATE TABLE Gelado (
    Id INT AUTO_INCREMENT,
    Descricao VARCHAR(50),
    Valor DOUBLE,
    PRIMARY KEY (Id)
);

CREATE TABLE Armazem (
    Id INT AUTO_INCREMENT,
    Nome VARCHAR(50),
    Localidade VARCHAR(50),
    PRIMARY KEY (Id)
);

CREATE TABLE Stock (
    Id INT AUTO_INCREMENT,
    GeladoId INT NOT NULL,
    ArmazemId INT NOT NULL,
    UnidadesInicial INT,
    PRIMARY KEY (Id),
    FOREIGN KEY (GeladoId) REFERENCES Gelado (Id),
	FOREIGN KEY (ArmazemId) REFERENCES Armazem (Id)
);


CREATE TABLE Venda (
    Id INT AUTO_INCREMENT,
    GeladoId INT NOT NULL,
    Quantidade INT,
    DataVenda DATE,
    PRIMARY KEY (Id),
    FOREIGN KEY (GeladoId) REFERENCES Gelado (Id)
);
*/

//AV1 Alínea 2 A)
//Post do armazém
app.post("/warehouse/new", (req,res) =>{
    var object = req.body;

    var queryIArmazem = "Insert into Armazem (Nome, Localidade) values (?)";
    var convertedObject = [[object.Nome, object.Localidade]];

    con.query(queryIArmazem, convertedObject, (err, result)=>{
        if(err) res.json(err);
        res.json("Armazem inserido com sucesso com o id "+result.insertId);
    });
});

//Post IceCream e respetivo stock
app.post("/icecream/add", (req, res) => {
    var object = req.body;

    var queryIGelado = "Insert into gelado (Descricao, Valor) values (?)";
    var convertedObject = [[object.Descricao, object.Valor]];

    con.query(queryIGelado, convertedObject, (err, result)=> {
        if(err) res.json(err);

        var text = "Gelado inserido com o id: "+result.insertId;

        var queryIStock = "Insert into Stock (GeladoId, ArmazemId, UnidadesInicial) values (?)";
        convertedObject = [[result.insertId,object.ArmazemId, object.UnidadesInicial]];

        con.query(queryIStock, convertedObject, (err, result2)=>{
            if(err) res.json(err);
            res.json(text+" e stock com o id: "+result2.insertId);
        })

    });
});


//AV1 Alínea 2 B)
//Post venda

app.post("/sell", (req,res) =>{
    var object = req.body;

    var queryIVenda = "Insert into Venda (GeladoId, Quantidade, DataVenda) values (?)";
    var convertedObject = [[object.GeladoId, object.Quantidade, object.DataVenda]];

    con.query(queryIVenda, convertedObject, (err, result)=>{
        if(err) res.json(err);
        res.json("Venda inserida com sucesso com o id "+result.insertId);
    });
});



//AV1 Alínea 2 C)
app.get("/warehouse/:id", (req, res)=>{
    var id = req.params.id;

    var querySelectStockAtual = "Select gelado.Descricao, (stock.UnidadesInicial - IFNULL(Sum(venda.Quantidade),0)) as StockAtual, (gelado.Valor*(stock.UnidadesInicial - IFNULL(Sum(venda.Quantidade),0))) AS ValorTotal from stock left join venda on venda.GeladoId = stock.GeladoId join gelado on gelado.id =stock.Geladoid join armazem on armazem.id=stock.armazemid where armazem.id= ? Group by gelado.descricao";
    con.query(querySelectStockAtual, id, (err,result)=>{
        if(err) res.json(err);
        else {
        res.json(result);
        }
        

    })
});



//AV1 Alínea 2 D)
//Get dos 5 gelados mais vendidos
app.get("/topsell", (req, res) => {
    var querySTopSell = "Select Gelado.Descricao as Nome, Sum(venda.Quantidade) as Numero_de_Vendas from Venda join Gelado on Gelado.Id = Venda.GeladoId Group by Gelado.Descricao order by Numero_de_Vendas desc limit 5";

    con.query(querySTopSell, (err,result)=>{
        if(err) res.json(err);
        res.json(result);
    })
})



app.listen(3000);
console.log("Listening on port: " + port);
