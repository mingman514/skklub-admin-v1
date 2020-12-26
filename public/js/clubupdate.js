
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
        url:'/info/update',
        type: 'POST',
        dataType: 'json'
    }).then((r) => {
        let cdata = r.data;

        // create select form
        try{
            let selectFormHTML = "";
            if(cdata.category1 && cdata.campus) {
                if(['중앙동아리','준중앙동아리', '독립동아리'].includes(cdata.category1) && cdata.campus.indexOf('명륜') > -1 ) {
                    selectFormHTML = `
                    ${cdata.category1}(명륜) :
                    <select name="category2" id="category2">
                        <option value="평면예술">평면예술</option>
                        <option value="연행예술">연행예술</option>
                        <option value="봉사">봉사</option>
                        <option value="취미교양">취미교양</option>
                        <option value="스포츠">스포츠</option>
                        <option value="종교분과">종교분과</option>
                        <option value="학술분과">학술분과</option>
                        <option value="인문사회">인문사회</option>
                        <option value="기타">기타</option>
                    </select><br>
                    `
                }
                
                if (['중앙동아리','준중앙동아리', '독립동아리'].includes(cdata.category1) && cdata.campus.indexOf('율전') > -1 ) {
                    selectFormHTML = `
                    ${cdata.category1}(율전) :
                    <select name="category2" id="category2">
                        <option value="평면예술">평면예술</option>
                        <option value="연행예술">연행예술</option>
                        <option value="봉사">봉사</option>
                        <option value="취미교양">취미교양</option>
                        <option value="스포츠">스포츠</option>
                        <option value="종교분과">종교분과</option>
                        <option value="학술분과">학술분과</option>
                        <option value="기타">기타</option>
                    </select><br>
                    `
                }
                
                if (['소모임', '준소모임'].includes(cdata.category1) && cdata.campus.indexOf('명륜') > -1 ) {
                    selectFormHTML = `
                    ${cdata.category1}(명륜) :
                    <select name="category2" id="category2">
                    <option value="경영대학">경영대학</option>
                    <option value="경제대학">경제대학</option>
                    <option value="문과대학">문과대학</option>
                    <option value="사범대학">사범대학</option>
                    <option value="사회과학대학">사회과학대학</option>
                    <option value="예술대학">예술대학</option>
                    <option value="유학대학">유학대학</option>
                    <option value="기타">기타</option>
                    </select><br>
                    `
                    }
                if (['소모임', '준소모임'].includes(cdata.category1) && cdata.campus.indexOf('율전') > -1 ) {
                    selectFormHTML = `
                    ${cdata.category1}(율전) :
                    <select name="category2" id="category2">
                    <option value="공과대학">공과대학</option>
                    <option value="생명공학대학">생명공학대학</option>
                    <option value="소프트웨어대학">소프트웨어대학</option>
                    <option value="스포츠과학대학">스포츠과학대학</option>
                    <option value="약학대학">약학대학</option>
                    <option value="자연과학대학">자연과학대학</option>
                    <option value="정보통신대학">정보통신대학</option>
                    <option value="기타">기타</option>
                    </select><br>
                    `
                }

                // insert HTML
                if(selectFormHTML !== ''){
                    $('#category2').html(selectFormHTML);
                }

            }
        } catch {
            console.log('Fail to create select form of category2');
        }


        // load text data
        for(var key in cdata){
            try {
                let $dom = $(`#${key}`);

                if($dom.prop('tagName') === 'INPUT' ){      // input tag이면 value에 넣기
                    $dom.val(cdata[key]);
                }
                else if ($dom.prop('tagName') === 'TEXTAREA'){  // textarea tag이면 textContent에 넣기
                    $dom.text(cdata[key]);
                } else {
                    continue;
                }

            } catch {
                console.log(`Cannot find [ ${key} ]`)
            }
        }

        // load logo img
        if(cdata['logo_path'] !== ""){
            $('#club_logo').attr('src', '/img/logo/' + cdata['logo_path']);
        }

        return cdata;

    })  // DATA LOAD END
    .then((cdata) => {
        // 사전입력 정보 불러오기
        $(`#category2 option[value="${cdata.category2}"]`).prop('selected', true);
        $(`#campus input[value="${cdata.campus}"]`).prop('checked', true);
            
    })
    

    // Save Logo Button Toggle
    $('#logoUpload').change( function(){
        if($('#logoUpload').prop('files').length){
            $('#saveUpdateBtn').parent().css('display', 'block')

            // save state
            $('#saveState i').removeClass('fa-check-circle')
                                .addClass('fa-exclamation-circle')
                                .css('color', 'red');
            $('#saveState span').text(' 업로드 되지 않음')
                                .css('color', 'red')

            readURL(this);      // preview

        } else {
            $('#saveUpdateBtn').parent().css('display', 'none')
        }
    })
    // Preview Logo
    function readURL(input) {
        if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
        $('#club_logo').attr('src', e.target.result);  
        }
        
        reader.readAsDataURL(input.files[0]);
        }
    }

    // Logo Update Ajax
    $('#saveUpdateBtn').on('click', function(){

        var data = new FormData();
        
        
        var uploadedFile = $('#logoUpload').prop('files')[0];


        // file 유효성 검사
        var fileForm = /(.*?)\.(jpg|jpeg|png|gif|bmp|JPG|JPEG|PNG|GIF|BMP)$/;
        var maxSize = 256 * 1024        // bytes
        if(!$('#logoUpload').val().match(fileForm)){     // file format
            // alert('img only')
            Util.showToast({
                'type': 'warning',
                'title': '경고',
                'content': '이미지 파일만 업로드할 수 있습니다.'
            })
            return false;
        } else if(uploadedFile.size > maxSize ){   // 256KB 제한
            // 문구
            Util.showToast({
                'type': 'warning',
                'title': '경고',
                'content': `${maxSize/1024}KB 이하의 파일만 업로드할 수 있습니다.`
            })
            return false;
        }
        

        Util.showAlert({
                'title' : '알림',
                'content' : '이미지를 업로드하시겠습니까?\n(기존 이미지는 삭제됩니다.)'
        }).then((result) => {
            // data binding (key-value)
            data.append('logoUpload', uploadedFile);

            $.ajax({
                type: 'POST',               
                processData: false, // important
                contentType: false, // important
                data: data,
                url: '/info/update/logo',
                dataType : 'json',  
                
                success: function(jsonData){
                    // save state
                    $('#saveState i').removeClass('fa-exclamation-circle')
                                        .addClass('fa-check-circle')
                                        .css('color', 'green');
                    $('#saveState span').text(' 업로드 완료')
                                        .css('color', 'black')
                    Util.showToast({
                    'title': '작업완료',
                    'content': `성공적으로 업로드 되었습니다.`
                    })
                }
            });
            
            Util.closeAlert();
        }) 
    });

    // save text
    $('#saveTextBtn').on('click', function(e){
        if($('input[name="category3"]').val() === ''){
            $('input[name="category3"]').val(' ');
        }
        if($('#logoUpload').val() && $('#saveState i').hasClass('fa-exclamation-circle')){      // 첨부한 파일이 존재하면서 업로드 전일때
            e.preventDefault();

            Util.showAlert({
                'title' : '경고',
                'content' : '로고파일이 업로드 되지 않았습니다.\n그래도 계속하시겠습니까?'
            }).then((result) => {
                $('#updateForm').submit()
            })
        } else {
            $('#updateForm').submit()
        }
    })


}
