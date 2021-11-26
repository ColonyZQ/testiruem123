const formId = 'telegramForm'
const form = document.getElementById(formId)
//функция для захвата данных из тегов формы и синтеза JSON-обьекта 
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
    //получаем данные из формы
    const json = toJSONString(form)
    //создаем соединение
    const formReq = new XMLHttpRequest()
    formReq.open('POST', '/telegram', true)
    ///////////////////////////////////
    /////////////SweetAlert//////////
    ///////////////////////////////////
    //обрабатываем ответ сервера
    formReq.onload = function(oEvent) {
      if (formReq.status === 200) {
        swal({
          title: 'Успешно отправлено!',
          icon: 'success',
          timer: 2000
        })
        document.querySelector('.sa-success').style.display = 'block'
        document.querySelector('.sa-button-container').style.opacity = '0'
      }
      if (formReq.status !== 200) {
        swal({
          title: 'Произошла ошибка!',
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
    //отправляем
    formReq.send(json)
  })
}


Back

На стороне сервера для начала нужно отловить запрос со стороны клиента, для этого в роутере пишем:

routes/index.js:

//Я вынес логику обработки данных в отдельный файл
const ctrlTelegram = require('../api/telegramMsg');
router.post('/telegram', ctrlTelegram.sendMsg);


api/telegramMsg.js:

module.exports.sendMsg = (req, res) => {
  //токен и id чата берутся из config.json
  const config = require('../config/config.json');
  let http = require('request')
  let reqBody = req.body
  //каждый элемент обьекта запихиваем в массив
  let fields = [
    '<b>Name</b>: ' + reqBody.name,
    '<b>Email</b>: ' + reqBody.email,
    reqBody.text
  ]
  let msg = ''
  //проходимся по массиву и склеиваем все в одну строку
  fields.forEach(field => {
    msg += field + '\n'
  });
  //кодируем результат в текст, понятный адресной строке
  msg = encodeURI(msg)
  //делаем запрос
  http.post(`https://api.telegram.org/bot${config.telegram.token}/sendMessage?chat_id=${config.telegram.chat}&parse_mode=html&text=${msg}`, function (error, response, body) {  
    //не забываем обработать ответ
    console.log('error:', error); 
    console.log('statusCode:', response && response.statusCode); 
    console.log('body:', body); 
    if(response.statusCode===200){
      res.status(200).json({status: 'ok', message: 'Успешно отправлено!'});
    }
    if(response.statusCode!==200){
      res.status(400).json({status: 'error', message: 'Произошла ошибка!'});
    }
  });

}
