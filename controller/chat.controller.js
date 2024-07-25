const chat = require("../models/chat.model");
const gem = require('../libs/gemini.js')
const promp = require("../models/prompt.model");
const keyGeminis = require("../models/apikey.model.js");
exports.conversation = async (req, res) => {
  const { id_object, messgaes, images, prompt_id,language } = req.body;
  const { user_id } = req.user;
  try {
    var data = await chat.find(id_object, user_id)
    let keyOpenAi = ""
    // random key gemini
    let lstKeys = await keyGeminis.list()
    if (lstKeys.length > 0) {
      // Random chỉ lấy 1 keygemini
      const randomIndex = Math.floor(Math.random() * lstKeys.length);
      const randomKey = lstKeys[randomIndex].keygemini;
      keyOpenAi = randomKey
      keyGeminis.updateCount(keyOpenAi)
    } else {
      keyOpenAi = "AIzaSyCG4lLnK_gyRhHZV5KHEwLHXXuHt4PySpA"
    }
    console.log(keyOpenAi)
    let reSetMsg = messgaes
    if (!data) {
      const msgForm = []
      // ----------------------------------------------------------------------
      let promptText = ""
      if(language){
        promptText += `Answer in language '${language}'.`
      }
      if (prompt_id) {
        //chèn thêm thông tin ptompt
        var props = await promp.find(prompt_id)
        if (props.form_submit) {
          promptText += props.form_submit
        }
        console.log(promptText)
      }
      reSetMsg = `${promptText}.Focus on the content of the question:[***]  ${reSetMsg}`
      var temp = await chat.register(id_object, user_id, JSON.stringify(msgForm))
    }
    //hoàn thanh update lịch sử
    var dataNew = await chat.find(id_object, user_id)
    //xử lý lại phần ảnh
    let lstImages = []
    if (images) {
      var temp = JSON.parse(images)
      temp.forEach(element => {
        lstImages.push(
          {
            inlineData: {
              data: element.base64,
              mimeType: "image/png",
            },
          }
        )
      });
    }
    var modelText = await gem.createTaskRequest(keyOpenAi, reSetMsg, JSON.parse(dataNew.messgaes), lstImages)
    if(!modelText){
      modelText = ''
    }
    //UPDATE LẠI lịch sử
    var list_msgs = JSON.parse(dataNew.messgaes) || []
    const msgForm = {
      role: "user",
      parts: [{ text: reSetMsg }],
    }
    if (list_msgs.length != 0) {
      list_msgs[0].parts.push({ text: reSetMsg })
    } else {
      list_msgs.push(msgForm)
    }
    const msgFormModel = {
      role: "model",
      parts: [{ text: modelText }],
    }
    if (list_msgs.length != 1) {
      list_msgs[1].parts.push({ text: modelText })
    } else {
      list_msgs.push(msgFormModel)
    }
    chat.update(JSON.stringify(list_msgs), id_object)
    res.status(200).send({
      status: true,
      messgaes: modelText
    });
  } catch (error) {
    res.status(501).send({
      status: false,
      msg: error
    });
  }
};
exports.find = async (req, res) => {
  try {
    const { id_object } = req.body;
    const { user_id } = req.user;
    var datas = await chat.find(id_object, user_id);
    res.send({
      status: true,
      data: datas,
    });
  } catch (error) {
    res.status(501).send({
      status: false,
      msg: 'error'
    });
  }
};
exports.list = async (req, res) => {
  try {
    const { user_id } = req.user;
    var datas = await chat.list(user_id);
    res.send({
      status: true,
      data: datas,
    });
  } catch (error) {
    res.status(501).send({
      status: false,
      msg: 'error'
    });
  }
};
exports.destroy = async (req, res) => {
  try {
    const { id_object } = req.body;
    const { user_id } = req.user;

    // Tìm dữ liệu theo id_object và user_id
    const datas = await chat.find(id_object, user_id);

    // Kiểm tra nếu dữ liệu không tồn tại
    if (!datas) {
      return res.status(404).send({
        status: false,
        msg: 'not found'
      });
    }

    // Xóa dữ liệu
    await datas.destroy();

    // Trả về phản hồi sau khi xóa thành công
    res.send({
      status: true
    });
  } catch (error) {
    // Ghi log lỗi chi tiết (nếu cần)
    console.error('Error:', error);

    // Trả về phản hồi lỗi
    res.status(501).send({
      status: false,
      msg: 'error'
    });
  }
};
