 const Util = {
    // -----------------------------------------------------------------
    // **** 자체 Alert Msg 사용법 ****
    // 원하는 비동기 처리 앞에 showAlert 넣고 .then((data)=>{ 비동기 }) 처리한다.
    // parameter로 alertTitle과 alertMsg의 option 주면 메시지 수정 가능하다.
    // -----------------------------------------------------------------
    showAlert: function(option){
        option = option || {};

        if($('#alertModal').length === 0){        // when alertModal is not yet created
            createAlertModal(option.alertTitle, option.alertMsg).then(()=>{
                $('#alertModal').modal();
            });
        } else {
            $('#alertModal').modal();
        }

        let dfd = $.Deferred();
        
        
        $('#alert-continue').off('click').on('click', function(){
            dfd.resolve('confirm');
        })

        return dfd.promise();
        

        // Create Alert
        function createAlertModal(alertTitle, alertMsg){
            let dfd = $.Deferred();

            let alertHTML = `
            <div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="alert-title" aria-hidden="true">
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
            $('body').append(alertHTML);

            dfd.resolve();            
            return dfd.promise();
        }
    },

    closeAlert : function(){
        $('#alertModal').modal('hide');
    },



    showConfirmModal : function(){


        function createConfirmModal(modalTitle, modalMsg){
            let dfd = $.Deferred();

            let modalHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>Holy guacamole!</strong> You should check in on some of those fields below.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            `
            $('body').append(modalHTML);

            dfd.resolve();            
            return dfd.promise();
        }
    },


    showAlertSmall : function(){


        function createConfirmModal(modalTitle, modalMsg){
            let dfd = $.Deferred();

            let modalHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>Holy guacamole!</strong> You should check in on some of those fields below.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            `
            $('body').append(modalHTML);

            dfd.resolve();            
            return dfd.promise();
        }
    }
}