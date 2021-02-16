import Util from './modules/util.js'

(function(){

    'use strict';

    // DOM
    const $cname = $('#cname');
    const $campus = $('#campus-select');
    const $category = $('#category-select');
    const $adminId = $('#admin-id');
    const $adminPw1 = $('#admin-pw1');
    const $adminPw2 = $('#admin-pw2');
    const $president = $('#president');
    const $contact = $('#contact');

    // Enter Event
    Util.enterSubmit($('input'), $('#requestRegist'));

    // Click Event
    $('#requestRegist').off('click').on('click', () => {

        let cname = $cname.val()
        let campus = $campus.val()
        let category = $category.val()
        let adminId = $adminId.val()
        let adminPw1 = $adminPw1.val()
        let adminPw2 = $adminPw2.val()
        let president = $president.val()
        let contact = $contact.val()
    
        let msg = ''
        let toastType = ''

        return new Promise((resolve, reject) => {
            
        // Input check
        if(!cname || !campus || !category || !adminId || !adminPw1 ||
                                    !adminPw2 || !president || !contact){
            msg = '모든 정보를 빠짐없이 입력해주세요.';
        } 
        else 
        if (!checkID(adminId)){
            msg = '아이디를 양식에 맞추어 주세요.<br>(5~20자리 영문과 숫자의 조합 / 공백금지)';
        } else if(!checkPW(adminPw1) || !checkPW(adminPw2)){
            msg = '비밀번호를 양식에 맞추어 주세요.<br>(6~20자리/ 영문, 숫자, 특수문자 사용가능 / 공백금지)';
        } else if(adminPw1 !== adminPw2){
            msg = '비밀번호가 일치하지 않습니다.'
        }
        // 아이디 중복체크 넣을위치 찾기....
        else {
            $.ajax({
                url:'/register/checkExistId',
                type: 'POST',
                data: {
                  'adminId' : adminId,
                  'id' : null   // not relavant, param for reusing funcs
                },
                dataType: 'json'
                }).then((r) => {
                    if(r.RESULT !== 'NEXT'){
                        if(r.RESULT === 'FAIL')
                            msg= '데이터베이스 오류입니다. 다시 시도해주세요.';
                        else if(r.RESULT === 'ALREADY_EXIST')
                            msg = '이미 존재하는 아이디입니다. 다른 아이디를 사용해주세요.';
                        
                        Util .showNoticeModal({ 'title' : '', 'content' : msg })
                        return false;      
                    }
                    // RESOLVE only when passed all tests
                    resolve();
            })
            
        }

        if(msg){   // 입력값 문제 확인시 중단
            Util.showNoticeModal({ 'title' : '', 'content' : msg })
            return false;
          }
        }).then((r) => {
        
        /**
         * Check Private Code
         */
        $.ajax({
            url:'/register/hasCode',
            type: 'POST',
            data: {
              'campus' : campus,
            },
            dataType: 'json'
          }).then((r) => {
              return new Promise((resolve, reject) => {
                switch (r.RESULT) {
                    case 'USE_CODE':
                        let _content = `<div>[${campus}] 스클럽 등록을 위해 가입코드를 입력해주세요.</div><br>
                        <div class="text-muted">(코드는 각 캠퍼스별 동아리연합회에 문의바랍니다.)</div><br>
                        <div class="md-form">  
                            <i class="fas fa-key prefix grey-text" style="left: 0.25rem;"></i>
                            <input type="text" id="verifyCode" class="form-control">
                            <label for="verifyCode">인증코드</label>
                        </div>
                        <div class="text-center my-3">
                            <button id="verifyCodeBtn" class="btn btn-indigo btn-block">인증하기</button>
                        </div>`;
                        Util.showNoticeModal({ 'title' : '', 'content' : _content })
                        Util.enterSubmit($('#verifyCode') , $('#verifyCodeBtn'));

                        $('#verifyCodeBtn').off().on('click', () => {

                            $.ajax({
                                url:'/register/matchCodeExtra',
                                type: 'POST',
                                data: {
                                    'campus' : campus,
                                    'verif_code' : $('#verifyCode').val(),
                                },
                                dataType: 'json'
                            }).then((r) => {
                                if(r.RESULT === 'MATCHED') {
                                    $('#noticeModal').modal('hide');
                                    msg = '인증이 완료되었습니다.'
                                    toastType = 'success';
                                    Util.showToast({ 'content' : msg, 'type' : toastType})
                                    resolve();
                                } else{
                                    if(r.RESULT === 'NOT_MATCHED'){
                                        msg = '인증번호가 일치하지 않습니다.'
                                        toastType = 'warning';
                                    } else {
                                        msg = '오류가 발생하였습니다.'
                                        toastType = 'danger';
                                    }
                                    Util.showToast({ 'content' : msg, 'type' : toastType})
                                    return false;
                                }
                            })
                        })
                            break;
                    case 'NO_CODE':
                    default:
                        resolve();
                }
            })
          }).then( (r) =>{
            Util.showAlert({
                'title': '알림',
                'content' : `작성한 정보로 [${cname}]의 계정을 신청하시겠습니까?`
             }).done((result) => {
                Util.closeAlert();
                $.ajax({

                    url:'/register/requestExtra',
                    type: 'POST',
                    data: {
                      'cname' : cname,
                      'campus' : campus,
                      'category1' : category,
                      'admin_id' : adminId,
                      'admin_pw' : adminPw1,
                      'president_name' : president,
                      'president_contact' : contact,
                    },
                    dataType: 'json'

                  }).then((r) => {

                    if(r.RESULT === 'SUCCESS'){
                        msg=`[${cname}]의 스클럽 계정신청이 완료되었습니다.<br>내부 심의부터 승인까지 수 일이 소요될 수 있습니다.`;
                        Util.showToast({ 'content' : '신청이 완료되었습니다.', 'type' : 'success'});
                    } else
                        msg = '서버에서 오류가 발생하였습니다. 다시 시도해주세요.';

                    Util.showNoticeModal({ 'title' : '알림', 'content' : msg })

                    setTimeout(() => { window.location.reload() }, 3000);
                  })
             })
          })


        

        })
    })


    function checkID(str){
        var regEx = /^[A-Za-z0-9_\-]{5,20}$/g;
        
        return regEx.test(str);
    }

    function checkPW(str){
        var regEx = /^[A-Za-z0-9!@#$%^*()\-_=+\\\|\[\]{};:\'",.<>\/?]{6,20}$/g;
        
        
        return regEx.test(str);
    }

    // 중복이면 true
    function duplicID(id){
        
    }

})();