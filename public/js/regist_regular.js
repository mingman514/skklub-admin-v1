/**
 * 이메일 인증 요청
 */
$('#requestVerif').off('click').on('click', () => {
    // email check
    let cname = $('#cname').val()
    let president = $('#president').val()
    let skkuMail = $('#skkuMail').val()

    let _content = ''
    let toastType = ''

    // Input check
    if(!cname || !president || !skkuMail){    // Incompleted Submit
      _content = '모든 정보를 빠짐없이 입력해주세요.'
    } else if (!isEmail(skkuMail)){   // email format
      _content = '이메일 형식을 지켜주세요.'
    } else if(!['skku.edu', 'g.skku.edu'].includes(skkuMail.split('@')[1])){    // SKKU email
      _content = '학교 이메일을 사용해주세요.\n(@skku.edu 또는 @g.skku.edu)'
    }
  
    if(_content){   // 입력값 문제 확인시 중단
      Util.showNoticeModal({ 'title' : '', 'content' : _content })
      return false;
    }
    
    // If no problem with input value
    $.ajax({
         url:'/register/verifyMail',
         type: 'POST',
         data: {
           'cname' : cname,
           'president' : president,
           'skku_mail' : skkuMail,
        },
         dataType: 'json'
    }).then((r) => {
      switch(r.RESULT){
        case 'SQL_ERROR':
          _content = '데이터베이스 오류가 발생했습니다.';
          break;
        case 'NOT_EXIST':
          _content = '대표자명이 다르거나 스클럽 인증대상 이메일이 아닙니다.';
          break;
        case 'ALREADY_EXIST':
          _content = '계정 발급이 완료된 단체입니다.';
          break;
        case 'OVER_TRY_LIMIT':
          _content = '인증요청 시도 한도를 초과하였습니다. 관리자에게 문의하세요.';
          break;
        case 'NEXT_STEP':
          _content = `<span>대상 이메일 : [ ${skkuMail} ]</span>
                      <div class="md-form">  
                        <i class="fas fa-key prefix grey-text" style="left: 0.25rem;"></i>
                        <input type="text" id="verifyCode" class="form-control">
                        <label for="verifyCode">인증번호</label>
                      </div>
                      <div class="text-center my-3">
                        <button id="verifyCodeBtn" class="btn btn-indigo btn-block" disabled>인증하기</button>
                      </div>`;
          break;
          default:
            _content = '알 수 없는 오류입니다.'

      }

      Util.showNoticeModal({ 'title' : '', 'content' : _content })

      // NEXT_STEP 시, 이메일로 인증코드 보내기
      if(r.RESULT === 'NEXT_STEP'){        

        $.ajax({
          url:'/register/sendVerifyCode',
          type: 'POST',
          data: {
            'id' : r.ID,
            'skku_mail' : skkuMail,
        },
          dataType: 'json'
        }).then((r) => {
          if(r.RESULT === 'SUCCESS'){     // DB UPDATE && MAIL SENT 성공 시
            Util.showToast({ 'content' : '인증번호가 전송되었습니다.'})
            $('#verifyCodeBtn')
              .removeAttr('disabled')
              .off('click').on('click', () => {
                  
                $.ajax({
                  url:'/register/matchVerifCode',
                  type: 'POST',
                  data: {
                    'id' : r.ID,
                    'verif_code' : $('#verifyCode').val(),
                },
                  dataType: 'json'
                }).then((r) => {
                  _content = '알 수 없는 오류입니다.'
                  toastType = ''
                  
                  switch(r.RESULT){
                    case 'TIME_OVER':
                      _content = '인증시간이 초과되었습니다.';
                      toastType = 'warning'
                      break;
                    case 'WRONG_CODE':
                      _content = '올바르지 않은 인증번호입니다.';
                      toastType = 'warning'
                      break;
                    case 'SUCCESS' :
                      _content = '인증에 성공하였습니다';
                      toastType = 'success'
                      break;
                  }
                  Util.showToast({ 'content' : _content, 'type' : toastType})
                  

                  // 인증 성공 시 SKKLUB 계정 생성페이지 Draw
                  if(r.RESULT === 'SUCCESS'){

                    $('#noticeModal').modal('hide');    // 모달창 닫기

                    // re-Draw
                    $('#registerForm').html(
                      `<div class="md-form">
                        <i class="fas fa-users prefix grey-text"></i>
                        <input type="text" id="cname" class="form-control" value="${cname}" disabled>
                        <label for="cname" class="active">신청 단체명(스클럽에 등록될 명칭)</label>
                      </div>
                      <div class="md-form">
                        <i class="fas fa-id-badge prefix grey-text"></i>
                        <input type="text" id="adminId" class="form-control" value="">
                        <label for="adminId">아이디(한글가능)</label>
                      </div>
                      <div class="md-form">
                        <i class="fas fa-lock prefix grey-text"></i>
                        <input type="password" id="adminPw1" class="form-control" value="">
                        <label for="adminPw1">비밀번호</label>
                      </div>
                      <div class="md-form">
                        <i class="fas fa-check-square prefix grey-text"></i>
                        <input type="password" id="adminPw2" class="form-control" value="">
                        <label for="adminPw2">비밀번호 확인</label>
                      </div>
                      <div class="text-center my-3">
                        <button id="createAccountBtn" class="btn btn-indigo btn-block">스클럽 계정생성</button>
                      </div>`
                    );

                    
                    $('#createAccountBtn').off('click').on('click', function(){
                      // Valid Check
                      let adminId = $('#adminId').val()
                      let adminPw1 = $('#adminPw1').val()
                      let adminPw2 = $('#adminPw2').val()
                      console.log(`id=${adminId}, pw1=${adminPw1}, pw2=${adminPw2}`)
                      // 1. 미입력/공백포함 여부
                      if(!adminId || !adminPw1 || !adminPw2){
                        Util.showToast({'type' : 'warning','content' : '제공된 양식을 모두 채워주세요.'})
                        return false;
                      }

                      var regExp = /\s/g;
                      if(regExp.test(adminId) || regExp.test(adminPw1) || regExp.test(adminPw2)){
                        Util.showToast({'type' : 'warning','content' : '아이디와 비밀번호에는 공백이 포함될 수 없습니다.'})
                        return false;
                      }
                      // 2. 비밀번호 최소조건
                      if( !lengthCheck(adminPw1, 6, 20) || !lengthCheck(adminPw2, 6, 20)){
                        Util.showToast({'type' : 'warning','content' : '비밀번호는 6~20자리로 설정해주세요.'})
                        return false;
                      }
                      // 3. 비밀번호 일치여부
                      if(adminPw1 !== adminPw2){
                        Util.showToast({'type' : 'warning','content' : '비밀번호를 일치시켜주세요.'})
                        return false;
                      }
                      
                      // 4. ID 중복 여부
                      $.ajax({
                        url:'/register/checkExistId',
                        type: 'POST',
                        data: {
                          'adminId' : adminId,
                          'id' : r.ID
                      },
                        dataType: 'json'
                      }).then((r) => {
                        console.log(r)
                        if(r.RESULT === 'FAIL'){
                          Util.showToast({'type' : 'error','content' : 'DB 조회 실패'})
                          return false;
                        }
                        else if( r.RESULT === 'ALREADY_EXIST'){
                          Util.showToast({'type' : 'warning','content' : '이미 존재하는 아이디입니다.'})
                          return false;
                        }
                        else if(r.RESULT === 'NEXT'){
                          // 아이디 등록
                          $.ajax({
                            url:'/register/createAccount',
                            type: 'POST',
                            data: {
                              'id' : r.ID,
                              'cname' : cname,
                              'adminId' : adminId,
                              'adminPw' : adminPw1
                          },
                            dataType: 'json'
                          }).then((r) => {
                            console.log(r)
                            Util.showNoticeModal({
                              'title':`계정생성 완료!`,
                              'content' : `<a href="/">SKKLUB 관리페이지</a>에서 [${cname}]의 상세정보를 기입하세요.`
                            })
                            
                            // 모달 닫히면 초기 페이지로
                            $('#noticeModal').on('hidden.bs.modal', (e) => {
                              location.href = '/register/regular'
                            })
    
                          })
                        }
                      })

                  })
                  }
                })
              })
          // DB UPDATE 및 MAIL SENT 실패시 escape
          } else {
            return false;
          }
        })


      }

    })
    
  })





function isEmail(targetEmail) {

  var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

	return regExp.test(targetEmail); // 형식에 맞는 경우 true 리턴	

}

function lengthCheck(str, min, max){
  if(str.length < min || str.length > max){
    return false;
  }
  return true;
}