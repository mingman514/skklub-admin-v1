require('dotenv').config()

const mysql = require('mysql')
var connection = mysql.createConnection({
    host: process.env.HOST_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    multipleStatements: true
});
connection.connect();

module.exports = {
    generalQuery: function(query, parms, callback){
        connection.query(query, parms, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    },
    // entireData: function () {
    //     connection.query(`select * from club`, function (error, results, fields) {
    //         if (error) {
    //             console.log(error);
    //         } else {
    //             console.log(results);
    //             return results
    //         }
    //     });
    //     connection.end()
    // },
    searchResult: function (input,searchColumn,callback) {
        connection.query(`select * from club where ${searchColumn}='${input}'`, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    },
    existingOptionList: function(callback){
        connection.query(`select distinct category1, category2 from club`, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    }

}