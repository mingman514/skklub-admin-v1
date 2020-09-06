// mysql DB to json file

require('dotenv').config()

const fs = require('fs')
const mysql = require('mysql')
const path = require('path')
var connection = mysql.createConnection({
    host: process.env.HOST_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME
});

module.exports = function(){
    connection.connect();
    connection.query(`SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'cid', cid, 
        'cname', cname, 
        'category1', category1, 
        'category2', category2, 
        'category3', category3, 
        'campus', campus, 
        'intro_text', intro_text, 
        'intro_sentence', intro_sentence, 
        'activity_info', activity_info, 
        'estab_year', estab_year,
        'meeting_time', meeting_time, 
        'recruit_season', recruit_season, 
        'recruit_num', recruit_num, 
        'activity_period', activity_period, 
        'recruit_process', recruit_process, 
        'activity_location', activity_location, 
        'website_link', website_link, 
        'activity_num', activity_num, 
        'president_name', president_name, 
        'president_contact', president_contact, 
        'recruit_site', recruit_site, 
        'logo_path', logo_path, 
        'admin_id', admin_id, 
        'admin_pw', admin_pw, 
        'authority', authority, 
        'emergency_contact', emergency_contact, 
        'website_link2', website_link2, 
        'recent_change_date', recent_change_date, 
        'registration_date', registration_date
        )) from club;`,

        function (error, results, fields) {
            if (error) {
                console.log(error);
            } else {
                // mysql 자체함수로 json형식으로 변환, 이후 replace로 null -> "" 로 치환
                // var data = results[0][`JSON_ARRAYAGG(JSON_OBJECT(\n    'cid', cid, \n    'cname', cname, \n    'category1', category1, \n    'category2', category2, \n    'category3', category3, \n    'campus', campus, \n    'intro_text', intro_text, \n    'intro_sentence', intro_sentence, \n    'activi`].replace(/null/gi,'""')
                var jsonkey = Object.keys(results[0])[0]
                console.log(jsonkey)
                var data = results[0][jsonkey].replace(/null/gi,'""')
                // 저장경로 설정
                var root = path.dirname(require.main.filename || process.mainModule.filename)
                fs.writeFileSync(root+'/data/skklubDB.json', data);
                console.log('JSON file updated successfully! :)')
            }
        });

    connection.end()
}