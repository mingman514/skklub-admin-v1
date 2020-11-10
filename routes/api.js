const express = require('express');
const router = express.Router();

const sql = require("../public/js/mysql-query");


// Category/Campus Format
router
    .get("/:category/:campus", (req, res, next) => {
        const clubCategory = req.params.category;
        const clubCampus = req.params.campus;
        
        let API_sql = `SELECT cid, cname, authority, category1, category2, category3, campus FROM club WHERE category1='${clubCategory}' AND campus='${clubCampus}' AND authority IN (1,3,9)`;
        sql.generalQuery(API_sql, null, (err, results) => {
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
                        recruit_season,
                        activity_period,
                        recruit_process,
                        activity_location
                FROM club
                WHERE category1='${clubCategory}' AND campus='${clubCampus}' AND cid='${clubId}'`
                
        sql.generalQuery(API_sql, null, (err, results) => {
            if (err) {
                console.log(err);
                res.send('FAIL')
            } else {
                console.log('SUCCESS')
                res.json(results);
            }
        });
    });







module.exports = router;