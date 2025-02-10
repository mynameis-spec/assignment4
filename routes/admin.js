var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
// const Users = require("../models/users")
const Items = require("../models/items")
const Users = require("../models/users")
var id_counter = 0
const saltRounds = 10

function loadAll(res, ERROR_LOG){
    Users.find().then((users) => {
        Items.find().then((items) => {
            res.render('admin', {ERROR_LOG: ERROR_LOG, items: items, users: users})
        })
    })
}
router.post('/addUser', (req, res) => {
    const {username, password, adminStatus} = req.body
    var userModel = new Users()
    let currentTime = new Date()
    Users.find({username: username}).then( (have) => {
        if (have.length){
            loadAll(res, "This username is already taken")
        }else {
            Users.find().then((users) => {
                bcrypt.hash(password, saltRounds, function (err, hash) {
                    if (err) {
                        console.log(err)
                    }
                    userModel.username = username
                    userModel.password = hash
                    userModel.userID = users.length
                    userModel.creationDate = currentTime
                    userModel.adminStatus = (adminStatus === "on")
                    userModel.deletionDate = currentTime
                    userModel.updateDate = currentTime

                    userModel.save().then(() => {
                        loadAll(res, "")
                    })
                })
            })
        }
    })
})
router.post('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    await Users.findByIdAndDelete(userId);
    res.redirect('/admin')

})
// ITEMS
function loadItems(res, ERROR_LOG, edit){

    Items.find().then((items) => {
        res.render('admin', {ERROR_LOG: ERROR_LOG, items: items})
    })
}
router.post('/del/:id', async (req, res) => {
    const itemId = req.params.id
    await Items.findByIdAndDelete(itemId)
    loadAll(res, "")
})
router.post('/edit/:id', async (req, res) => {
    const itemId= req.params.id;
    const {url1, url2, url3, name_ru, name_en, desc_ru, desc_en} = req.body;
    await Items.findByIdAndUpdate(itemId, {url1: url1, url2: url2, url3: url3, name_ru: name_ru, name_en: name_en, desc_ru: desc_ru, desc_en: desc_en}, {upsert: false}).then(()=>{
        loadAll(res, "")
    })
})
router.post('/add', (req, res) => {
    const {url1, url2, url3, name_ru, name_en, desc_ru, desc_en} = req.body;
    var itemsChannel = new Items()
    Items.find().then((items) => {
        let maxId = items.reduce((x, item) => Math.max(x, item.itemId), 0)
        itemsChannel.itemId = maxId + 1
        itemsChannel.url1 = url1
        itemsChannel.url2 = url2
        itemsChannel.url3 = url3
        itemsChannel.name_ru = name_ru
        itemsChannel.name_en = name_en
        itemsChannel.desc_ru = desc_ru
        itemsChannel.desc_en = desc_en
        itemsChannel.save().then(() => {
            loadAll(res, "")
        })
    })
})
router.get('/edit/:id', (req, res) => {
    const itemId = req.params.id;
    Items.findById(itemId).then(item => {
        res.render('editPage', {item: item});
    })
})

router.get('/', (req, res) => {
    loadAll(res, "")
})
module.exports = router;
