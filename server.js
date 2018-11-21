var sleep = require("sleep");
var tietokanta = require("./dbHaku");
sleep.sleep(1);
var avr = require("./avr");
sleep.sleep(1);



// kulutetaan aikaa, jotta ko. export.tiedot keretään toteuttaa
setTimeout(TiedotKannasta, 1500);



var valot = "";
var avrAika = "";
var socketAika = "";

var keittio;
var makuuhuone;
var kuisti;

// haetaan pelkästään valojen tilat valot muuttujaan hbHaku.js:stä
function TiedotKannasta() {

    valot = tietokanta.valot;
    keittio = valot[0];
    makuuhuone = valot[1];
    kuisti = valot[2];
    console.log("tallennettu muuttujiin valojen tilat:  " +keittio + ","+makuuhuone+","+kuisti);

}


var app = require('http').createServer(handler),
        io = require('socket.io').listen(app),
        fs = require('fs');


    app.listen(80);

    function handler(req, res) {
        var file = __dirname + '/public/index.html';
        fs.readFile(file,

        function(err, data)
        {
            if(err)
                {
                    res.writeHead(500);
                    return res.end('html sivua ei löytynyt');
                }

          console.log('Selain lataus');
          res.writeHead(200);
          res.end(data);
        }
        );
    }

    var online = 0;
    var tapahtumia = 0;

io.sockets.on('connection', function (socket)
{       ++online; ++tapahtumia;


      if(keittio == 1)
        {
          socket.emit('keittioMuuttuja1', { mkeittio: '1' });
        }
      if(keittio == 0)
        {
          socket.emit('keittioMuuttuja0', { mkeittio: '0' });
        }

      if(makuuhuone == 1)
        {
          socket.emit('makuuhuoneMuuttuja1', { mmakuuhuone: '1' });
        }
      if(makuuhuone == 0)
        {
          socket.emit('makuuhuoneMuuttuja0', { mmakuuhuone: '0' });
        }

      if(kuisti == 1)
        {
          socket.emit('kuistiMuuttuja1', { mkuisti: '1' });
        }
      if(kuisti == 0)
        {
          socket.emit('kuistiMuuttuja0', { mkuisti: '0' });
        }


        console.log("Uusi yhteys: " +socket.id + ", kayttajia linjoilla: "+online);

          //keittio selainohjaus
      socket.on('keittio paalle', function (data) {
        var heksa = '02';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        keittio = 1;
       console.log("Keittio ohjattu selaimessa paalle");
      });

      socket.on('keittio pois', function (data) {
        var heksa = '01';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        keittio = 0;
       console.log("Keittio ohjattu selaimessa pois");
      });

          //kuisti selainohjaus
      socket.on('kuisti paalle', function (data) {
        var heksa = '06';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        kuisti = 1;
       console.log("Kuisti ohjattu selaimessa paalle");
      });

      socket.on('kuisti pois', function (data) {
        var heksa = '05';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        kuisti = 0;
       console.log("Kuisti ohjattu selaimessa pois");
      });
          //makuuhuone selainohjaus
      socket.on('makuuhuone paalle', function (data) {
        var heksa = '04';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        makuuhuone = 1;
       console.log("Makuuhuone ohjattu selaimessa paalle");
      });

      socket.on('makuuhuone pois', function (data) {
        var heksa = '03';
        avr.Lahetys(Buffer.from(heksa, 'hex')); // lähetetään avr.js lähetysfunktioon
        makuuhuone = 0;
       console.log("Makuuhuone ohjattu selaimessa pois");
      });

      socket.on('pingSocket', function (data){
        console.log('ping lahetetty socketista');
        var heksa = '11';
        var pingV = 'e';
        avr.Lahetys(Buffer.from(heksa, 'hex'));

        var pingkierros = 0;

        do{
            pingkierros++;
            pingV = avr.pingok;
            if(pingkierros == 1500)
            break;
        }
        while(pingV == 'ok');
        var kulunutaika = data;
        socket.emit('pingVastaus', kulunutaika);
        console.log('pingVastaus sockettiin lahetetty');
      });


      socket.on('disconnect', function() {
            --online;
            console.log('Yksi kayttaja poistui, jaljella on: ' + online);


            var tietokantaWrite = require('./dbWrite');

            if(tapahtumia != 0 && online == 0)
            {
              tietokantaWrite.tiedotKantaan(keittio, makuuhuone, kuisti)
            }

      });
});
