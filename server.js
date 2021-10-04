'use strict' ;
const express = require('express');
const app = express();
const cors = require('cors');
const Axios = require('axios');
require('dotenv').config();
app.use(cors());
app.use(express.json());
const mongoose = require('mongoose');
const PORT = process.env.PORT;
const API = process.env.API_URL ;
const MONGO = process.env.MONGO_URL ;
mongoose.connect(`mongodb+srv://${MONGO}?retryWrites=true&w=majority`,{useNewUrlParser:true,useUnifiedTopology:true});
app.listen(PORT, ()=>{
    console.log('You In PORT : ', PORT);
})
/// API ///
class Page {constructor(title,api_model, artist_display){
    this.title= title ;
    this.api_model = api_model ;
    this.artist_display = artist_display ;
}}
const getData = async (req,res) => {
    let URL=`https://${API}` ;
    let axiosRes = await Axios.get(URL);
    let Data = axiosRes.data.data ;
    let cleanData = Data.map(item => {
        return new Page(item.title,item.api_model,item.artist_display)
    })
    res.status(200).json(cleanData);
}
app.get('/data',getData);
////// DB ////////
const SCM = new mongoose.Schema({
    title : String ,
    api_model : String,
    artist_display : String
});
let seed = () => {
    let newPage = new PageModel({
        title : "test00" ,
        api_model : "test00",
        artist_display : "test00"
    })
    newPage.save();
}
const PageModel = mongoose.model('page',SCM);
let pageController = (req,res) => {
    PageModel.find().then(data => {
        res.status(200).json(data);
    })
}
app.get('/DBseed', seed);
app.get('/DBdata', pageController);
/////// POST ////////
const createPageController = async (req,res) => {
    let pageData = req.body ;
    let newPage = PageModel(pageData);
    newPage.save();
    let data = await PageModel.find({});
    res.status(201).json(data);
}
app.post('/create',createPageController);
/////////// UPDATE ////////////
const updatePageController = async (req,res) => {
    let ID = req.params.id ;
    let update = req.body ;
    PageModel.findOne({_id:ID}).then(item =>{
        item.title = update.title ,
        item.api_model = update.api_model ,
        item.artist_display = update.artist_display
        item.save();
    });
    let UP = await PageModel.find({});
    res.status(200).send(UP);
}
app.put('/update/:id', updatePageController ) ;
/////////// DELETE ////////////
const deletePageController = async (req,res) => {
    let ID = req.params.id ;
    PageModel.findByIdAndDelete(ID,(error,data) => {
        if (error){
            res.status(500).send('ERROR');
        }else {
            PageModel.find({}).then(item => {
                res.json(item);
            })
        }
    })
}
app.delete('/delete/:id', deletePageController)