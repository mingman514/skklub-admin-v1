const sql = require("./mysql-query");

module.exports = {

    insertLogByCid: function (cid, ip, logName, actionDetail) {

        // Get log meta data
        sql.generalQuery(`
            INSERT INTO USR_LOG (LOG_CDE, ACTION, ACTION_DETAIL, CID, CNAME, USR_IP)
            SELECT CONCAT(LOG_CLS, LOG_VAL), LOG_NAME, '${actionDetail}', '${cid}', (SELECT cname FROM ${process.env.PROCESSING_DB} WHERE cid=${cid}),'${ip}'
            FROM MAN_LOG_CODE
            WHERE LOG_NAME='${logName}';
            `, null, (err, results) => {
            console.log(`Log Write SUCCESS : ${logName} ${actionDetail ? '| ' + actionDetail : ""}`);
        })

    },

    getClientIp: function (req) {
        // Get IP
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(req.headers['x-forwarded-for'])
        console.log(req.connection.remoteAddress)
        if (ip.indexOf(':') > -1) {
            let splitedIp = ip.split(':');
            ip = splitedIp[splitedIp.length - 1]
        }

        return ip;
    }

}