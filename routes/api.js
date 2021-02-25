const express = require('express');
const router = express.Router();

const sql = require("../custom_modules/mysql-query");

/**
     * @author mingman
     * Seed needs to be changed once a day.
     * Therefore, seed format should be 'yyyymmdd',
     * which is a number of 8 digits.
     * 
     * Get today's date and then convert it into format above.
     */
var dateSeed = getSeedForRand();


    /**
     * API FOR TEST
     */
router
.get("/test/:category/:campus", (req, res, next) => {
    const clubCategory = req.params.category;
    const clubCampus = req.params.campus;
    console.log("/test/:category/:campus")
    let API_sql = `SELECT cid, cname, authority, category1, category2, category3, campus, logo_path
                   FROM CLUB_TEST
                   WHERE 1=1${convertCategory(clubCategory)}${convertCampus(clubCampus)} AND authority NOT IN (0, 2, 4, 6)
                   ORDER BY RAND(${dateSeed})`;
    console.log(API_sql)
    sql.requestData(API_sql, null, (err, results) => {
        if (err) {
            console.log(err);
            res.send('FAIL')
        } else {
            console.log('SUCCESS')
            res.json(results);
        }
    });
});

router
.get("/test/:category/:campus/:cid", (req, res, next) => {
    const clubCategory = req.params.category;
    const clubCampus = req.params.campus;
    const clubId = req.params.cid;
    console.log("/test/:category/:campu/:cid")
    let API_sql = `SELECT 
                    cid,
                    cname,
                    campus,
                    authority,
                    category1,
                    category2,
                    category3,
                    logo_path,
                    estab_year,
                    intro_text,
                    recruit_num,
                    activity_num,
                    activity_info,
                    meeting_time,
                    recruit_site,
                    website_link,
                    website_link2,
                    intro_sentence,
                    president_name,
                    president_contact,
                    recruit_season,
                    activity_period,
                    recruit_process,
                    activity_location
            FROM CLUB_TEST
            WHERE 1=1${convertCategory(clubCategory)}${convertCampus(clubCampus)} AND cid='${clubId}'`
            
    sql.requestData(API_sql, null, (err, results) => {
        if (err) {
            console.log(err);
            res.send('FAIL')
        } else {
            console.log('SUCCESS')
            res.json(results);
        }
    });
});

 /**
  * API For Service
  */
// Category/Campus Format
router
    .get("/:category/:campus", (req, res, next) => {
        const clubCategory = req.params.category;
        const clubCampus = req.params.campus;
        console.log("/:category/:campus")
        let API_sql = `SELECT cid, cname, authority, category1, category2, category3, campus, logo_path
                       FROM CLUB
                       WHERE 1=1${convertCategory(clubCategory)}${convertCampus(clubCampus)} AND authority NOT IN (0, 2, 4, 6)
                       ORDER BY RAND(${dateSeed})`;

        sql.requestData(API_sql, null, (err, results) => {
            if (err) {
                console.log(err);
                res.send('FAIL')
            } else {
                console.log('SUCCESS')
                res.json(results);
            }
        });
    });
  

// Category/Campus/Cid Format
router
    .get("/:category/:campus/:cid", (req, res, next) => {
        const clubCategory = req.params.category;
        const clubCampus = req.params.campus;
        const clubId = req.params.cid;
        
        let API_sql = `SELECT 
                        cid,
                        cname,
                        campus,
                        authority,
                        category1,
                        category2,
                        category3,
                        logo_path,
                        estab_year,
                        intro_text,
                        recruit_num,
                        activity_num,
                        meeting_time,
                        recruit_site,
                        website_link,
                        activity_info,
                        website_link2,
                        intro_sentence,
                        president_name,
                        president_contact,
                        recruit_season,
                        activity_period,
                        recruit_process,
                        activity_location
                FROM CLUB
                WHERE 1=1${convertCategory(clubCategory)}${convertCampus(clubCampus)} AND cid='${clubId}'`
                
        sql.requestData(API_sql, null, (err, results) => {
            if (err) {
                console.log(err);
                res.send('FAIL')
            } else {
                console.log('SUCCESS')
                res.json(results);
            }
        });
    });


// FUNCTIONS
function convertCategory(clubCategory){
    let conditions = ' ';
        // category converting
    switch(clubCategory){
        case 'central-clubs':
            conditions += "AND category1='중앙동아리'"; break;
        case 'independent-clubs':
            conditions += "AND (category1='준중앙동아리' OR category1='독립동아리')"; break;
        case 'groups':
            conditions += "AND (category1='소모임' OR category1='준소모임')"; break;
        case 'academic-clubs':
            conditions += "AND category1='학회'"; break;
        case 'student-org':
            conditions += "AND category1='학생단체'"; break;
        default:
            conditions = '';
    }
    return conditions;
}

function convertCampus(clubCampus){
    let conditions = ' ';
    // campus converting
    switch(clubCampus){
        case 'seoul':
                conditions += "AND campus='명륜'"; break;
        case 'suwon':
            conditions += "AND campus='율전'"; break;
        default:
            conditions = '';
    }
    return conditions;
}

function getSeedForRand() {
    // Converter date -> int
    let date = new Date();
    let year = date.getFullYear(); 
    let month = new String(date.getMonth()+1);
    let day = new String(date.getDate());

    month = addZero(month);
    day = addZero(day);
    
    return (Number) (year + month + day);

    function addZero(str) {
        return str.length == 1? '0' + str : str;
    }
}

module.exports = router;