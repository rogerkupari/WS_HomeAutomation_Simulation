var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', { autoOpen: false, baudRate: 9600, dataBits: 8, parity: 'none', stopBits: 1 });
var sleep = require("sleep");

// muuttujat ajan mittausta varten
var time = new Date();
var aika1;
var aika2;
var tulos;

//Bufferit lahetysta varten
var keittio1 = Buffer.from('02', 'hex'); // keittio1
var keittio0 = Buffer.from('01', 'hex'); // keittio0

var makuuhuone1 = Buffer.from('04', 'hex'); // makuuhuone1
var makuuhuone0 = Buffer.from('03', 'hex'); // makuuhuone0

var kuisti1 = Buffer.from('06', 'hex'); // kuisti1
var kuisti0 = Buffer.from('05', 'hex'); // kuisti0

var virhe = Buffer.from('66', 'hex'); // "virhe"
var ping = Buffer.from('11', 'hex'); // ping


  port.open(function (err) {
  if (err) {
    return console.log('sarjaportin avauksessa virhe: ', err.message);
  }


});

function Lahetys (tieto)
{

  port.write(tieto);
  aika1 = time.getMilliseconds(); // haetaan aika

}

module.exports.Lahetys = Lahetys; // lahetysfunktio exportataan



port.on('data', function (data) {

  var paluuViesti = data.toString('hex');
  var tulkittu = "";
  var virheLippu = 0;

  var painikeliput = [0,0,0,0,0,0]; // [0] = keittio0, [1] = keittio1, [2] = mh0, [3] = mh1, [4]=kuisti0, [5]=kuisti1

  switch (paluuViesti) {
    case 'a2': ++virheLippu; break;
    case 'b1': painikeliput[1]=1; painikeliput[0]=0; break; // keittio1
    case 'e1': painikeliput[0]=1; painikeliput[1]=0; break; // keittio0
    case 'b2': painikeliput[3]=1; painikeliput[2]=0; break; // mh1
    case 'e2': painikeliput[2]=1; painikeliput[3]=0; break; //mh0
    case 'b3': painikeliput[5]=1; painikeliput[4]=0; break; // kuisti1
    case 'e3': painikeliput[4]=1; painikeliput[5]=0; break; // kuisti0

    default:

  }
  if(virheLippu == 0)
  {
    if (painikeliput[0,5] == 0 && paluuViesti == 'aa')
    {
      console.log("sarjaliilenneohjaus suoritettu");
    }
    //Keittiö
    if (painikeliput[1] == 1 && painikeliput[0] == 0 )
    {
      console.log('keittiö ohjattu painikkeesta päälle');
    }
    if (painikeliput[0] == 1 && painikeliput[1] == 0)
    {
      console.log('keittiö ohjattu painikkeesta pois päältä');
    }
    //makuuhuone
    if (painikeliput[3] == 1 && painikeliput[2] == 0 )
    {
      console.log('makuuhuone ohjattu painikkeesta päälle');
    }
    if (painikeliput[2] == 1 && painikeliput[3] == 0)
    {
      console.log('makuuhuone ohjattu painikkeesta pois päältä');
    }
    //kuisti
    if (painikeliput[5] == 1 && painikeliput[4] == 0 )
    {
      console.log('kuisti ohjattu painikkeesta päälle');
    }
    if (painikeliput[4] == 1 && painikeliput[5] == 0)
    {
      console.log('kuisti ohjattu painikkeesta pois päältä');
    }
    if (paluuViesti == 'ff')
    {
      var vastausmuuttuja = 'ok';
      exports.pingok = vastausmuuttuja;
    }




      // haetaan aika, lasketaan kulunut aika ja valmistetaan aikamuuttuja kutsuttavaksi
    aika2 = time.getMilliseconds();
    tulos = aika2-aika1;
    exports.aika = tulos;


  }
  else
  {
    console.log("virhe sarjaliikenteen paluuviestissä: '" + paluuViesti + "', " + "tiedostossa: ", __filename);
    virheLippu = 0;
  }
});
