
import Util from './modules/util.js'

(function(){

    'use strict';

    // DOM
    const mainTabContent = $('.tab-content.main-tab');

    const clubsTabBtn = $('#btn-tab-clubs');
    const manageTabBtn = $('#btn-tab-manage');
    const logTabBtn = $('#btn-tab-log');

    [clubsTabBtn, manageTabBtn, logTabBtn].forEach((e) => {
        
        e.off('click').on('click', (t) => {
            var selected = $(t.target).text().toLowerCase();
            
            $.ajax({
                url:'/master/openTab',
                type: 'POST',
                data: {tabName : selected},
                dataType: 'JSON',
                cache : false,
            }).done(function(r){
                if(r.RESULT === 'SUCCESS'){
                    console.log(r.HTML)
                    mainTabContent.html(r.HTML);
                }
            })
        })
    })
    

})();