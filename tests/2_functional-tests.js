const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const project = '';

let _id;

suite('Functional Tests', function() {
    suite( 'Create Issue', function() {
        test( 'Create an issue with every field: POST request to /api/issues/{project}', function(done) {
            chai.request( server )
            .post("/api/issues/apitest")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
              issue_title: "every_field",
              issue_text: "issue_text",
              created_by: "created_by",
              open: true,
              assigned_to: "assigned_to",
              status_text: "status_text"
            })
             .end( ( err,res ) => {
                _id = res.body._id;
                assert.equal( res.status, 200 );
                assert.equal( res.body.issue_title, "every_field");
                assert.equal( res.body.issue_text, "issue_text");
                assert.equal( res.body.created_by, "created_by");
                assert.equal( res.body.assigned_to, "assigned_to");
                assert.equal( res.body.status_text, "status_text");
                assert.equal( res.body.open, true);

                done();
             } );
        } ).timeout(10000);
        test( 'Create an issue with only required fields: POST request to /api/issues/{project}', done => {
            chai.request( server )
            .post("/api/issues/apitest")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
              issue_title: "issue_title",
              issue_text: "issue_text",
              created_by: "created_by",
            })
             .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.equal( res.body.issue_title, "issue_title");
                assert.equal( res.body.issue_text, "issue_text");
                assert.equal( res.body.created_by, "created_by");
                assert.equal( res.body.assigned_to, "");
                assert.equal( res.body.status_text, "");
                assert.equal( res.body.open, true);
                done();
             } );
        } );
        test( 'Create an issue with missing required fields: POST request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .post("/api/issues/apitest")
            .set("content-type", "application/x-www-form-urlencoded")
            .send({
              open: true,
              assigned_to: "",
              status_text: ""
            })
             .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                done();
             } );
        } );
    })
    suite( 'Get Issue', ( ) => {
        test( 'View issues on a project: GET request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .get("/api/issues/apitest")
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.isArray(
                    res.body,
                    "A plain GET request to /api/issues/apitest returns an array"
                );
                done();
            } );
        } );
        test( 'View issues on a project with one filter: GET request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .get("/api/issues/apitest")
            .query({ open: false })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.isArray(
                    res.body,
                    "A GET request with a single filter to /api/issues/apitest returns an array"
                );
                for (let i = 0; i < res.body.length; i++) {
                    assert.equal(res.body[i].open, false);
                }
                done();
            } );
        } );
        test( 'View issues on a project with multiple filters: GET request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .get("/api/issues/apitest")
            .query({ open: false, _id: _id })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.isArray(
                    res.body,
                    "A GET request with multiple filters to /api/issues/apitest returns an array"
                );
                console.log('_id', _id, res.body)
                for (let i = 0; i < res.body.length; i++) {
                    assert.equal(res.body[i].open, false);
                    assert.equal(res.body[i]._id, _id);
                }
                done();
            } );
        } );
    })
    suite( 'Update Issue', ( ) => {
        test( 'Update one field on an issue: PUT request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .put("/api/issues/apitest")
            .send({
                issue_title: "issue_title edited",
                _id: _id
            })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, {
                    result: "successfully updated",
                    _id: _id
                });
                done();
            } );
        } );
        test( 'Update multiple fields on an issue: PUT request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .put("/api/issues/apitest")
            .send({
                issue_title: "issue_title edited with multiple fields.",
                open: false,
                _id: _id
            })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, {
                    result: "successfully updated",
                    _id: _id
                });
                done();
            } );
        } );
        test( 'Update an issue with missing _id: PUT request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .put("/api/issues/apitest")
            .send({
                issue_title: "issue_title edited"
            })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, { error: "missing _id" });
                done();
            } );
        } );
        test( 'Update an issue with no fields to update: PUT request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .put("/api/issues/apitest")
            .send({
                _id: _id
            })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, {
                    error: "no update field(s) sent",
                    _id: _id
                    });
                done();
            } );
        } );
        test( 'Update an issue with an invalid _id: PUT request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .put("/api/issues/apitest")
            .send({
                issue_title: "issue_title edited",
                _id: "69869gy6g57"
            })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, {
                    error: "could not update",
                    _id: "69869gy6g57"
                });
                done();
            } );
        } );
    })
    suite( 'Delete Issue', ( ) => {
        test( 'Delete an issue: DELETE request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .delete("/api/issues/apitest")
            .send({ _id: _id })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, {
                    result: "successfully deleted",
                    _id: _id
                });
                done();
            } );
        } );
        test( 'Delete an issue with missing _id: DELETE request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .delete("/api/issues/apitest")
            .send({})
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, { error: "missing _id" });
                done();
            } );
        } );
        test( 'Delete an issue with invalid _id: DELETE request to /api/issues/{project}', ( done ) => {
            chai.request( server )
            .delete("/api/issues/apitest")
            .send({_id: "k868787tt75765uu675" })
            .end( ( err,res ) => {
                assert.equal( res.status, 200 );
                assert.deepEqual(res.body, { 
                    error: "could not delete", 
                    _id: "k868787tt75765uu675" 
                });
                done();
            } );
        } );
    })
});
