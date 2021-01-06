
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

window.onload = function(){
    /***************************************
     * 
     * Load Club Data
     * 
     ***************************************/
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
    
    
    
        /***************************************
         * 
         * Temporary Saved Data
         * 
         ***************************************/
        $.ajax({
            url:'/info/check-temp',
            type: 'POST',
            dataType: 'json'
        }).then((r) => {

            if(r.result === 'EXIST'){
                Util.showAlert({
                    'title' : '알림',
                    'content' : '임시저장된 데이터가 존재합니다.<br>불러오시겠습니까?',
                    'positive' : '불러오기',
                    'negative' : '취소'
                }).then((result) => {
                    Util.closeAlert();
                    // load stored data
                    $.ajax({
                     url:'/info/load-temp',
                     type: 'POST',
                     dataType: 'json'
                     }).then((r) => {
     
                         let cdata = r.data;
                         for(var key in cdata){
                             try {
                                 let $dom = $(`#${key}`);
     
                                 if($dom.prop('tagName') === 'INPUT' ){      // input tag이면 value에 넣기
                                     $dom.val(cdata[key]);
                                 }
                                 else if ($dom.prop('tagName') === 'TEXTAREA'){  // textarea tag이면 textContent에 넣기
                                     $dom.text(cdata[key]);
                                 }
     
                             } catch {
                                 console.log(`Cannot find [ ${key} ]`)
                             }
                         }
     
                         Util.showToast({
                             'type': 'success',
                             'title': '성공',
                             'content': '데이터 불러오기가 완료되었습니다.'
                         })
                     }, () => {     // then의 두번째 콜백 인자 => when reject
                        Util.showToast({
                            'type': 'error',
                            'title': '실패',
                            'content': '데이터를 불러올 수 없습니다.'
                        })
                     })
                });
            }
         })
    })

    
    

    

     /***************************************
     * 
     * Bounding Events
     * 
     ***************************************/
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
                'content' : '이미지를 업로드하시겠습니까?<br>(기존 이미지는 삭제됩니다.)'
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
        const $category3 = $('input[name="category3"]');
        if($category3.val() === '' || $category3.val() === null){
            $category3.val(' ');
        }
        e.preventDefault();
        
        if($('#logoUpload').val() && $('#saveState i').hasClass('fa-exclamation-circle')){      // 첨부한 파일이 존재하면서 업로드 전일때

            Util.showAlert({
                'title' : '경고',
                'content' : '로고파일이 업로드 되지 않았습니다.<br>그래도 계속하시겠습니까?'
            }).then((result) => {
                $('#updateForm').submit();
            })
        } else {
            Util.showAlert({
                'title' : '확인',
                'content' : '변경사항을 저장하시겠습니까?<br>(SKKLUB 즉시 반영)'
            }).then((result) => {
                $('#updateForm').submit();
            })
        }
    })


    /* Save Temp Button */

    // Change Event
    // $('input[type="text"], textarea').keypress(() => {
    $('input[type="text"], textarea').on('keyup' ,() => {
        // change btn feature
        const $floatingBtn = $('#floatingBtn');
        if($floatingBtn.hasClass('btn-info')){
            $floatingBtn.switchClass('btn-info', 'btn-warning', 1000, 'easeInOutQuad');

            // 랜덤하게 저장하라는 툴팁 띄워주기
            // if(!(Math.floor(Math.random()*10) % 3)){
            //     // add tooltip event
            //     let contents = ['날려도 책임 못 져요..', '틈틈이 저장하기!', '잠깐..! 저장은 했나요?'];

            //     /** 아래 형식은 어떻게 쓰는건가... */
            //     const popover = new mdb.Popover($('#floatingBtn'), {
            //         animation : true,
            //         content : contents[Math.floor(Math.random()*3)],
            //         trigger : 'manual',
            //         placement : 'top',
            //     })
            //     popover.show();
            //     setTimeout(() => { popover.hide(); }, 7000);
            // }
        }
    })
    

    // Hover Event
    $('#floatingBtn').hover(() => {
        // mouseover
        $('#floatingBtn').children().eq(0).hide();
        $('#floatingBtn').children().eq(1).show();
    }, () => {
        // mouseleave
        $('#floatingBtn').children().eq(1).hide();
        $('#floatingBtn').children().eq(0).show();
    })

    // Click Event
    $('#floatingBtn').click( () => {
        const $floatingBtn = $('#floatingBtn');
        const $icon = $floatingBtn.children().eq(0);

        if($icon.hasClass('fa-check') || $floatingBtn.hasClass('btn-success'))
            return ;

        $.ajax({
            url:'/info/save-temp',
            type: 'POST',
            data: $('#updateForm').serialize(),     // serialize : GET all the form values
            dataType: 'text'
        }).then((r) => {
            if(r === 'SUCCESS'){
                Util.showToast({
                    'type': 'success',
                    'title': '성공',
                    'content': '데이터 임시저장이 완료되었습니다.'
                })

                $floatingBtn.removeClass('btn-info btn-warning').addClass('btn-success');
                $icon.switchClass('fa-archive', 'fa-check');

                setTimeout(() => {
                    $floatingBtn.switchClass('btn-success', 'btn-info', 1000, 'easeIn');
                    $icon.switchClass('fa-check', 'fa-archive', 1000, 'easeIn');
                }, 4000);
                
            } else {
                Util.showToast({
                    'type': 'warning',
                    'title': '실패',
                    'content': '데이터 임시저장에 실패하였습니다.'
                })
            }
        }, () => {
            // when disconnected
            Util.showToast({
                'type': 'warning',
                'title': '실패',
                'content': '서버와 연결이 중단되었습니다.<br>새로고침해주세요.'
            })
        })
    })

    
    


}
