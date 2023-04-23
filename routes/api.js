'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true
});

const issueSchema = new mongoose.Schema({
  project:{
    type: String,
    required: true
  },
  issue_title:{
    type: String,
    required: true
  },
  issue_text:{
    type: String,
    required: true
  },
  created_by:{
    type: String,
    required: true
  },
  assigned_to:{
    type: String
  },
  status_text:{
    type: String
  },
  open:{
    type: Boolean,
    default: true
  }
}, {
  collection: 'issue',
  timestamps: {
    createdAt: 'created_on',
    updatedAt: 'updated_on'
  }
});

const issueModel = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      const project = req.params.project.trim();
      let conditions = { project: project };
      let keys = Object.keys(req.query)
      const fields = '_id issue_title issue_text created_by assigned_to status_text open'.split(' ');
      for(let i=0; i<keys.length;i++){
        if(fields.includes(keys[i])){
          conditions[keys[i]] = req.query[keys[i]]
        }
      }
      conditions = {$and:[conditions]}
			issueModel.find(conditions)
			.sort('date')
      .exec()
			.then(data => {
				if (data) {
					return res.json(data);
				} else {
          return res.json(data);
        }
			});
    })
    
    .post(function (req, res){
      const project = req.params.project.trim();
      
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;
      let open = req.body.open;

      if(!issue_title || !issue_text || !created_by){
        return res.json({error: 'required field(s) missing'});
      }

      if(assigned_to == undefined){
        assigned_to = '';
      }

      if(status_text == undefined){
        status_text = '';
      }

      if(!open){
        open = true;
      }

			let issue = new issueModel({
        project: project,
        issue_title: issue_title.trim(),
        issue_text: issue_text.trim(),
        created_by: created_by.trim(),
        assigned_to: assigned_to.trim() ? assigned_to.trim() : '',
        status_text: status_text.trim() ? status_text.trim() : '',
        open: (open == 'true') || (open == true) ? true : false,
      });

			//console.log('issue', issue)
			issue.save()
			.then((data) => {
				return res.json({ 
          _id: data._id, 
          project: data.project,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_by: data.created_by,
          assigned_to: data.assigned_to,
          status_text: data.status_text,
          open: data.open,
          created_on: data.created_on,
          updated_on: data.updated_on,
        });
			})
			.catch(err => {
				console.log(err)
				return res.json(err);
			});
    })
    
    .put(function (req, res){
      const project = req.params.project.trim();
      let _id = '';
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;
      let open = req.body.open;

      if((req.body._id == undefined) || (req.body._id == '')){
        return res.json({error: 'missing _id'});
      } else{
        _id = req.body._id;
      }

      if(assigned_to == undefined){
        assigned_to = '';
      }

      if(status_text == undefined){
        status_text = '';
      }

      if(!open){
        open = false;
      }
      
      let form_fields = {};
      let body_keys = Object.keys(req.body)
      if(body_keys.includes('_id') && body_keys.length == 1){
        return res.json({'_id': _id, error: 'no update field(s) sent' });
      }else {
        const fields = 'issue_title issue_text created_by assigned_to status_text open'.split(' ');
        for(let i=0; i<body_keys.length;i++){
          if(fields.includes(body_keys[i])){
            form_fields[body_keys[i]] = req.body[body_keys[i]]
          }
        }
        let conditions = { project: project, _id: _id };
        conditions = {$and:[conditions]}
        //console.log('conditions', form_fields, body_keys.length, conditions);
        issueModel.findOneAndUpdate(conditions, form_fields)
        .exec()
        .then(data => {
          //console.log('findByIdAndUpdate data', data);
          if (data) {
            return res.json({result: 'successfully updated', '_id': _id});
          } else {
            return res.json({error: 'could not update', '_id': _id });
          }
        })
        .catch(err => {
          //console.log('findByIdAndUpdate err', err);
          return res.json({error: 'could not update', '_id': _id });
        });
      }
    })
    
    .delete(function (req, res){
      const project = req.params.project.trim();
      let _id = '';
      if((req.body._id == undefined) || (req.body._id == '')){
        return res.json({error: 'missing _id'});
      } else{
        _id = req.body._id;
      } 
      let conditions = { project: project, _id: _id };
      conditions = {$and:[conditions]}
			issueModel.deleteOne(conditions)
      .exec()
			.then(data => {
        if(data.deletedCount > 0){
          return res.json({result: 'successfully deleted', '_id': _id});
        } else {
          return res.json({error: 'could not delete', '_id': _id});
        }
      })
      .catch(e => {
        return res.json({error: 'could not delete', '_id': _id});
      });
    });
    
};
