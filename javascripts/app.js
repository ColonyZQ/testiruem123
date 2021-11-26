const formId = 'telegramForm'
const form = document.getElementById(formId)
//������� ��� ������� ������ �� ����� ����� � ������� JSON-������� 
function toJSONString(form) {
  var obj = {}
  var elements = form.querySelectorAll('input, select, textarea')
  for (var i = 0; i < elements.length; ++i) {
    var element = elements[i]
    var name = element.name
    var value = element.value
    if (name) {
      obj[ name ] = value
    }
  }
  return JSON.stringify(obj)
}
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault()
    //�������� ������ �� �����
    const json = toJSONString(form)
    //������� ����������
    const formReq = new XMLHttpRequest()
    formReq.open('POST', '/telegram', true)
    ///////////////////////////////////
    /////////////SweetAlert//////////
    ///////////////////////////////////
    //������������ ����� �������
    formReq.onload = function(oEvent) {
      if (formReq.status === 200) {
        swal({
          title: '������� ����������!',
          icon: 'success',
          timer: 2000
        })
        document.querySelector('.sa-success').style.display = 'block'
        document.querySelector('.sa-button-container').style.opacity = '0'
      }
      if (formReq.status !== 200) {
        swal({
          title: '��������� ������!',
          icon: 'error',
          timer: 2000
        })
        document.querySelector('.sa-error').style.display = 'block'
        document.querySelector('.sa-button-container').style.opacity = '0'
      }
    }
    ////////////////////////////
    ////////////////////////////
    formReq.setRequestHeader('Content-Type', 'application/json')
    //����������
    formReq.send(json)
  })
}


Back

�� ������� ������� ��� ������ ����� �������� ������ �� ������� �������, ��� ����� � ������� �����:

routes/index.js:

//� ����� ������ ��������� ������ � ��������� ����
const ctrlTelegram = require('../api/telegramMsg');
router.post('/telegram', ctrlTelegram.sendMsg);


api/telegramMsg.js:

module.exports.sendMsg = (req, res) => {
  //����� � id ���� ������� �� config.json
  const config = require('../config/config.json');
  let http = require('request')
  let reqBody = req.body
  //������ ������� ������� ���������� � ������
  let fields = [
    '<b>Name</b>: ' + reqBody.name,
    '<b>Email</b>: ' + reqBody.email,
    reqBody.text
  ]
  let msg = ''
  //���������� �� ������� � ��������� ��� � ���� ������
  fields.forEach(field => {
    msg += field + '\n'
  });
  //�������� ��������� � �����, �������� �������� ������
  msg = encodeURI(msg)
  //������ ������
  http.post(`https://api.telegram.org/bot${config.telegram.token}/sendMessage?chat_id=${config.telegram.chat}&parse_mode=html&text=${msg}`, function (error, response, body) {  
    //�� �������� ���������� �����
    console.log('error:', error); 
    console.log('statusCode:', response && response.statusCode); 
    console.log('body:', body); 
    if(response.statusCode===200){
      res.status(200).json({status: 'ok', message: '������� ����������!'});
    }
    if(response.statusCode!==200){
      res.status(400).json({status: 'error', message: '��������� ������!'});
    }
  });

}
