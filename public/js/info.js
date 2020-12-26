
/**
 * @since 2020-12-26
 * @author mingman
 * 
 * Content Security Policy 위반(script in html code)에 따라
 * 기본 html 로드 후에 데이터를 AJAX로 요청,
 * 통신 결과를 Script로 받아와 html에 write 하는 방식으로 구현
 * 
 */
import Util from './modules/util.js'

// Loading Club Data
window.onload = function(){

    $.ajax({
        url:'/info',
        type: 'POST',
        dataType: 'json'
    }).then((r) => {
        let cdata = r.data;
        // text data
        for(var key in cdata){
            if(key === null || key === ""){ continue; }

            try {
                // data pre-processing
                let URLRecogContent = cdata[key].replace(/\n/gi, '<br>')    // CRLF processing

                if(['intro_text', 'activity_info', 'recruit_site', 'website_link', 'website_link2'].includes(key)){
                    URLRecogContent = URLRecogContent.replace(Util.userPatterns.url, '<a href="$&" target="_blank" style="color:blue;">$&</a>');  // URL recognition
                }
                $(`#${key}`).html(URLRecogContent);
                
            } catch {
                console.log(`Cannot find [ ${key} ]`)
            }
        }

        // logo img
        if(cdata['logo_path'] !== ""){
            let img = $('#club_logo').attr('src', '/img/logo/' + cdata['logo_path']);
        }

      })

}