var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
mongoose.connect('mongodb+srv://root:Zz0503917867@tgstore-onqgo.gcp.mongodb.net/emenu?authSource=admin&replicaSet=tgstore-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', { useNewUrlParser: true });

var storeDataSchema = new Schema({
    name: { type: String },
    ownerId: {
        type: ObjectId,
        ref: 'User',
    },
    street: { type: String },
    phone: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    website: { type: String },
})

var groupDataSchema = new Schema({
    name: String,
    store: {
        type: ObjectId,
        ref: 'Store'
    },
    ownerId: {
        type: ObjectId,
        ref: 'User',
    },
    translations: [
        {
            lg: { type: String },
            name: { type: String },
        }
    ]
});

var Store = mongoose.model('Store', storeDataSchema);
var Group = mongoose.model('Group', groupDataSchema);

router.get('/:id', async function(req, res, next) {
    const storeId = req.params.id;
    const language = req.locale;
    if (storeId.length != 24) {
        res.send({items: []});
        console.log("store not good");
        return;
    }
    var store = await Store.findOne({_id: ObjectId(storeId)}, {_id: 0, ownerId: 0, __v: 0});
    if (!store) {
        res.send({items: []});
        console.log("store not found");
        return;
    } 
    // var groups = await Group.find().where('store').equals(ObjectId(storeId));
    var groups = await Group.aggregate([
        {
          '$match': {
            'store': new ObjectId(storeId)
          }
        }, {
          '$project': {
            'store': 0, 
            'ownerId': 0, 
            '__v': 0, 
            'translations._id': 0
          }
        }, {
          '$lookup': {
            'as': 'commodities', 
            'from': 'commodities', 
            'as': 'commodities', 
            'let': {
              'group': '$group', 
              'id': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$group', '$$id'
                        ]
                      }, {
                        '$eq': [
                          '$isActive', true
                        ]
                      }
                    ]
                  }
                }
              }
            ]
          }
        }, {
          '$project': {
            '_id': 0,
            'commodities._id': 0, 
            'commodities.group': 0, 
            'commodities.ownerId': 0, 
            'commodities.__v': 0, 
            'commodities.isActive': 0, 
            'commodities.translations._id': 0
          }
        }
    ]).exec();
    groups.forEach(function(group, index){
        if (language != "ru" && group.translations) {
            var translation = group.translations.find(x => x.lg == language);
            if (translation) {
                group.name = translation.name;
            }
        }
        delete group.translations;
        
        group.commodities.forEach(function(commodity){
            if (language != "ru" && commodity.translations) {
                var translation = commodity.translations.find(x => x.lg == language);
                if (translation) {
                    commodity.name = translation.name;
                    commodity.description = translation.descr;
                }
            }
            delete commodity.translations;
        })

        if (group.commodities.length < 1) {
            groups.splice(index, 1);
        }
    });
    res.send({store: store, groups: groups});
});

module.exports = router;