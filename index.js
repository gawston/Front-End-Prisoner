const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const base = 'http://localhost:5000';

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.locals.user = null;

// get all product and set to app.locals.products
axios.get(`${base}/getallproduct`)
  .then(response => {
    app.locals.products = response.data;
  })
  .catch(error => {
    console.log(error);
  });

app.get('/', (req, res) => {
  res.render('index.ejs', { data: app.locals.user });
});

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', (req, res) => {
  axios.post(`${base}/createuser`, req.body)
    .then(response => {
      if (response.data.registerfailed == true) {
        res.redirect('/register');
      } else {
        res.redirect('/login');
      }
    })
    .catch(error => {
      res.redirect('/register');
    });
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/login', (req, res) => {
  axios.post(`${base}/login`, req.body)
    .then(response => {
      if (response.data.statuslogin == true) {
        app.locals.user = response.data;
        console.log(app.locals.user);
        // res.render('index.ejs', { data: response.data });
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
      // console.log(response.data);
    })
    .catch(error => {
      res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
  app.locals.user = null;
  res.redirect('/');
});

app.get('/profile', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else {
    res.render('profile.ejs', { data: app.locals.user });
  }
});

app.get('/editprofile', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else {
    res.render('editprofile.ejs', { data: app.locals.user });
  }
});

// update user profile by id and set to app.locals.user and redirect to profile page
app.post('/editprofile', (req, res) => {
  console.log("id", app.locals.user.data.userid);
  axios.put(`${base}/updateuser/${app.locals.user.data.userid}`, req.body)
    .then(response => {
      if(response.data.updatefailed == true) {
        res.redirect('/editprofile');
      } else {
        app.locals.user = {statuslogin: true, data: response.data};
        console.log(app.locals.user);
        res.redirect('/profile');
      }
    })
    .catch(error => {
      res.redirect('/editprofile');
    });
});

// delete user by id and redirect to login page
app.get('/deleteuser', (req, res) => {
  axios.delete(`${base}/deleteuser/${app.locals.user.data.userid}`)
    .then(response => {
      app.locals.user = null;
      res.redirect('/login');
    })
    .catch(error => {
      res.redirect('/profile');
    });
});

// add product if user role is admin

app.get('/addproduct', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else if (app.locals.user.data.role != 'admin') {
    res.redirect('/');
  } else {
    res.render('addproduct.ejs');
  }
});

app.post('/addproduct', (req, res) => {
  axios.post(`${base}/createproduct`, req.body)
    .then(response => {
      res.redirect('/manageproduct');
    })
    .catch(error => {
      res.redirect('/addproduct');
    });
});

// manage product if user role is admin
app.get('/manageproduct', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else if (app.locals.user.data.role != 'admin') {
    res.redirect('/');
  } else {
    res.render('manageproduct.ejs', { products: app.locals.products });
  }
});

app.get('/product', (req, res) => {
  axios.get(`${base}/getallproduct`)
    .then(response => {
      app.locals.products = response.data;
      res.render('allproduct.ejs', { products: response.data });
    })
    .catch(error => {
      res.redirect('/');
    });
});

// get product by category
app.get('/product/:category', (req, res) => {
  axios.get(`${base}/getproduct/${req.params.category}`)
    .then(response => {
      res.render('allproduct.ejs', { products: response.data });
    })
    .catch(error => {
      res.redirect('/');
    });
});

app.get('/cart', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else {
    res.render('cart.ejs');
  }
});

// add product to cart by user id and product id
app.post('/addtocart', (req, res) => {
  if(app.locals.user == null) {
    res.redirect('/login');
  } else {
    console.log(req.body);
    axios.post(`${base}/addcart/${req.body.id}`, req.body)
      .then(response => {
        res.redirect('/product');
      })
      .catch(error => {
        res.redirect('/');
      });
  }
});

app.get('/history', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else {
    res.render('history.ejs');
  }
});

app.get('/order', (req, res) => {
  res.render('orderdetails.ejs');
});

app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword.ejs');
});

app.get('/changepassword', (req, res) => {
  res.render('changepassword.ejs');
});

app.get('/manager', (req, res) => {
  res.render('manager.ejs');
});

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000/');
});

