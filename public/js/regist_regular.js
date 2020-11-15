/**
 * 이메일 인증 요청
 */
$('#requestVerif').off('click').on('click', () => {
    // email check
    let cname = $('#cname').val()
    let president = $('#president').val()
    let skkuMail = $('#skkuMail').val()

    let _content = ''

    // Input check
    if(!cname || !president || !skkuMail){    // Incompleted Submit
      _content = '모든 정보를 빠짐없이 입력해주세요.'
    } else if (!isEmail(skkuMail)){   // email format
      _content = '이메일 형식을 지켜주세요.'
    } else if(!['skku.edu', 'g.skku.edu'].includes(skkuMail.split('@')[1])){    // SKKU email
      _content = '학교 이메일을 사용해주세요.\n(@skku.edu 또는 @g.skku.edu)'
    }
  
    if(_content){   // 입력값 문제 확인시 중단
      Util.showNoticeModal({
        'title' : '',
        'content' : _content
      })
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
        // case 'OVER_TRY_LIMIT':
        //   _content = '인증요청 시도 한도를 초과하였습니다. 관리자에게 문의하세요.';
          // break;
        case 'NEXT_STEP':
          _content = `<span>[ ${skkuMail} ]로 인증번호가 발송되었습니다.</span>
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

      Util.showNoticeModal({
        'title' : '',
        'content' : _content
      })

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
                }).then((r) => {})


                })


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