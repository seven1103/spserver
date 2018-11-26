var Modal = function(obj){//本方法基于jq
    console.log(obj.fnName)
    let object = {
        title:obj.title || '暂无',
        html:obj.html||'暂无',
        modalid:obj.id,
        fn_name:obj.fnName
    }
    let modal_header = `<div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                        &times;
                    </button>
                    <h4 class="modal-title" id="myModalLabel">
                       ${object.title}
                    </h4>
                </div>`
    let modal_content = object.html;
    let modal_footer = `<div class="modal-footer">
                            <button type="button" class="btn btn-primary confirm" onclick="${object.fn_name}()">
                                确定
                            </button>
                        </div>`
    let dom = `<div class="modal fade" id="${object.modalid}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        ${modal_header} ${modal_content} ${modal_footer}
                    </div>
                </div
             </div>`
    $('.appmain').append(dom);
}