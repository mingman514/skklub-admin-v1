const bcrypt = require('bcrypt')


module.exports = {
    // Hash Items
    hashItem : async function(item, callback){

        try {

            const hashedPassword = await bcrypt.hash(item, 10);
            callback(hashedPassword);

        } catch(error) {

            console.log(error);
            
        }
    }
    

}