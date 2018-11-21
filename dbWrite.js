var mysql = require('mysql');

function tiedotKantaan(keittio, makuuhuone, kuisti)
{

  var con = mysql.createConnection({
    host     : '******',
    user     : '******',
    password : '******',
    database : '******'
  });

  con.connect(function(err) {
    if (err)
    {
      console.log("Tietokantaan ei saada yhteyttä dbWrite.js")
    }
    else
    {
      var sql = "UPDATE valot SET valot = "+keittio+" WHERE id = '1'";
      con.query(sql, function (err, result) {
        if (err)
        {
          console.log("Keittiön tietoja ei pystytty päivittämään tietokantaan")
        }
        else
        console.log(result.affectedRows + "keittiö Päivitetty tietokantaan");
      });

      sql = "UPDATE valot SET valot = "+makuuhuone+" WHERE id = '2'";
      con.query(sql, function (err, result) {
        if (err)
        {
          console.log("makuuhuoneen tietoja ei pystytty päivittämään tietokantaan")
        }
        else
        console.log(result.affectedRows + "makuuhuone Päivitetty tietokantaan");
      });

      sql = "UPDATE valot SET valot = "+kuisti+" WHERE id = '3'";
      con.query(sql, function (err, result) {
        if (err)
        {
          console.log("kuistin tietoja ei pystytty päivittämään tietokantaan")
        }
        else
        console.log(result.affectedRows + "kuisti Päivitetty tietokantaan");
      });

    }

  });
}

module.exports.tiedotKantaan = tiedotKantaan;
