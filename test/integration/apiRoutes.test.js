var request = require('supertest');
var server = request.agent('http://localhost:6969');


describe('GET /api/checkAuthentication', function(){
    it('login', loginUser());
    it('uri that requires user to be logged in', function(done){
    server
        .get('/api/checkAuthentication')                       
        .expect(200)
        .end(function(err, res){
            if (err) return done(err);
            console.log(res.body);
            done()
        });
    });
});


function loginUser() {
    return function(done) {
        server
            .post('/api/login')
            .send({ username: '123', password: '123' })
            .expect(302)
            .expect('Location', '/')
            .end(onResponse);

        function onResponse(err, res) {
           if (err) return done(err);
           return done();
        }
    };
};