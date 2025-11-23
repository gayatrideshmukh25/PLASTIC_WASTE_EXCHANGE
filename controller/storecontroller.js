
exports.home = (req,resp,next) => {
    resp.render('host/home');
}

exports.about = (req, resp, next) => {
    resp.render('store/about');
}

exports.contact = (req, resp, next) => {
    resp.render('store/contact');
}

exports.learnMore = (req, resp, next) => {
    resp.render('store/learnMore');
}
   
              