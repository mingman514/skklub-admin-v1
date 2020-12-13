
const {promisify} = require('util'); //<-- Require promisify
const getIP = promisify(require('external-ip')()); // <-- And then wrap the library

const sql = require("./mysql-query");

module.exports = {

    insertLogByCid : function(cid, ip, logName, actionDetail){
        // Get IP
        // getIP().then((ip)=> {

            // Get log meta data
            sql.generalQuery(`
            INSERT INTO USR_LOG (LOG_CDE, ACTION, ACTION_DETAIL, CID, CNAME, USR_IP)
            SELECT CONCAT(LOG_CLS, LOG_VAL), LOG_NAME, '${actionDetail}', '${cid}', (SELECT cname FROM ${process.env.PROCESSING_DB} WHERE cid=${cid}),'${ip}'
            FROM MAN_LOG_CODE
            WHERE LOG_NAME='${logName}';
            `, null, (err, results) => {
                console.log('Log Write SUCCESS');
            })

        // }).catch((error) => {
        //     console.error(error);
        // });
    }

}