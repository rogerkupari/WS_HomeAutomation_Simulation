var mysql      = require('mysql'); // kutsutaan mysql liitännäistä
var tiedot = []; // muuttuja taulukko
var valot = [];
var lippu = 0; // lippumuuttuja virheenilmaisun tueksi

var connection = mysql.createConnection({
  host     : '******',
  user     : '******',    
  password : '******',
  database : '******'
});

connection.connect();

connection.query('SELECT * from valot', function(err, rows, fields) { // sql lau-seella valitaan taulu
  if (err) // liitännäisen virheen tarkistus
  {
    lippu = 0;
    console.log('TAPAHTUI VIRHE TIETOKANTAKYSELYSSA, (tietoja ei tallennettu):', err);
    console.log("tiedostossa: ", __filename) // Virhetilanteessa on ihan hyvä tie-tää missä tiedostossa virhe on tapahtunut
  }
  else
  {
    for (var i = 0; i < rows.length; i++) // jos ei virhettä, haetaan tiedot tau-lusta
        {
            lippu++;
            var row = rows[i];
            tiedot[i] = row.id + ":" + row.huone + ":" + row.valot; // tallenne-taan tiedot taulukko muuttujaan
            valot[i] = row.valot;

        }
  }

  if(lippu != tiedot.length) // omaa virheen tarkistusta, eli jos lipussa on eri arvo kun taulun arvolla = virhe
    {
      console.log("jokin meni pieleen, kaikkia tietoja ei saatu tietokannasta / ", __filename);
    }
  else
    {
    console.log("Saatu onnistuneesti tiedot tietokannasta ja tallennettu tiedot taulukkomuuttujaan, jossa riveja " + tiedot.length + "kpl");
    exports.valot = valot; // jos tiedot ovat tallentuneet, valmistellaan muuttuja kutsuttavaksi toisesta tiedostosta.
    console.log(tiedot);

    }

});
connection.end();
