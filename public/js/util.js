 const Util = {
    // -----------------------------------------------------------------
    // **** 자체 Alert Msg 사용법 ****
    // 원하는 비동기 처리 앞에 showAlert 넣고 .then((data)=>{ 비동기 }) 처리한다.
    // parameter로 alertTitle과 alertMsg의 option 주면 메시지 수정 가능하다.
    // -----------------------------------------------------------------
    showAlert: function(option){
        option = option || {};

        createAlertModal(option.alertTitle, option.alertMsg).then(()=>{
            $('#alertModal').modal();
        });

        let dfd = $.Deferred();
        
        
        $('#alert-continue').off('click').on('click', function(){
            dfd.resolve('confirm');
        })

        return dfd.promise();
        

        // Create Alert
        function createAlertModal(alertTitle, alertMsg){
            let dfd = $.Deferred();

            let alertHTML = `
            <div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="alert-title" aria-hidden="true" data-backdrop="false">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title w-100" id="alert-title">
                        ${alertTitle? alertTitle : '알림'}
                    </h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="alertModal-body text-center mt-4" id="alert-msg">
                    ${alertMsg ? alertMsg : '작업을 계속하시겠습니까?'}
                </div>
                <div class="alertModal-footer text-center p-2">
                    <button type="button" class="btn btn-primary" id="alert-continue">예</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">아니오</button>
                </div>
                </div>
            </div>
            </div>
            `
            $('#moduleArea').html(alertHTML);

            dfd.resolve();            
            return dfd.promise();
        }
    },

    closeAlert : function(){
        $('#alertModal').modal('hide');
    },



    showToast : function(option){
        // https://codeseven.github.io/toastr/demo.html   Toast Generator
        // REQUIRE => toastr.js, toastr.css
        option = option || {};

        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": true,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "3000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
        let _title = option.title ? option.title : '알림';
        let _content = option.content ? option.content : '성공적으로 반영하였습니다.';
        
        switch (option.type){
            case 'info':
                toastr.info(_content, _title);
                break;
            case 'warning':
                toastr.warning(_content, _title);
                break;
            case 'error':
                toastr.error(_content, _title);
                break;
            case 'success':
            default:
                toastr.success(_content, _title);   
        }
        
    },


    showNoticeModal : function(option){
        // 정보제공용 모달
        option = option || {};

        createNoticeModal(option.modalTitle, option.modalMsg).then(()=>{
            $('#noticeModal').modal();
        });

        function createNoticeModal(modalTitle, modalMsg){
            const deferred = $.Deferred();

            let modalHTML = `
            <div class="modal fade top" id="noticeModal" tabindex="-1" role="dialog" aria-labelledby="notice-title" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="notice-title">
                        ${modalTitle? modalTitle : '알림'}
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-center">
                    ${modalMsg? modalMsg : '확인하였습니다.'}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">닫기</button>
                </div>
                </div>
            </div>
            </div>
            `
            $('#moduleArea').html(modalHTML);
            deferred.resolve();

            return deferred.promise();
        }
    }
}