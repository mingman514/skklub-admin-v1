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
    requestData: function(query, parms, callback){
        connection.query(query, parms, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    },
    // entireData: function () {
    //     connection.query(`select * from ${process.env.PROCESSING_DB}`, function (error, results, fields) {
    //         if (error) {
    //             console.log(error);
    //         } else {
    //             console.log(results);
    //             return results
    //         }
    //     });
    //     connection.end()
    // },
    /**
     * @param string input          - 조건검색 키워드
     * @param string searchColumn   - 조건검색 컬럼
     * @todo 모든 컬럼 명시하는 대신 효율적으로 필요한 정보만 불러오는 방법 모색
     */
    getClubInfo : function (input, searchColumn, callback) {
        connection.query(`
        SELECT  cname, category1, category2, category3, campus, intro_text, intro_sentence, activity_info,
                estab_year, meeting_time, recruit_season, recruit_num, activity_period, recruit_process,
                activity_location, website_link, website_link2, activity_num, president_name, president_contact,
                recruit_site, logo_path, emergency_contact
        FROM ${process.env.PROCESSING_DB}
        WHERE ${searchColumn}='${input}'`, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    },
    existingOptionList: function(callback){
        connection.query(`SELECT DISTINCT category1, category2 FROM ${process.env.PROCESSING_DB}`, (error, results, fields) => {
            if (error) {
                callback(error, null)
            } else {
                callback(null, results)
            }
        })
    }

}