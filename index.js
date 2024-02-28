const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// const base = 'http://localhost:5000';
const base = 'http://node58973-prisoner-project.proen.app.ruk-com.cloud';

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.locals.user = null;
app.locals.loginerror = false;
app.locals.registererror = false;
app.locals.editprofileerror = false;
app.locals.cartlength = 0;

axios.default.withCredentials = true;

// get all product and set to app.locals.products
axios.get(`${base}/getallproduct`)
  .then(response => {
    app.locals.products = response.data;
  })
  .catch(error => {
    console.log(error);
  });

app.get('/', (req, res) => {
  if (app.locals.user != null) {
    if(app.locals.user.statuslogin == true) {
      // get cart length
      axios.get(`${base}/getallcart/${app.locals.user.data.userid}`)
        .then(response => {
          let cart = response.data.cartuser;
          app.locals.cartlength = cart.length;
        })
        .catch(error => {
          console.log(error);
        });
    }
  }
  res.render('index.ejs', { data: app.locals.user });
});
 
app.get('/register', (req, res) => {
  res.render('register.ejs');
  app.locals.registererror = false;
});

app.post('/register', (req, res) => {
  axios.post(`${base}/createuser`, req.body)
    .then(response => {
      if (response.data.registerfailed == true) {
        app.locals.registererror = true;
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
  app.locals.loginerror = false;
});

app.post('/login', (req, res) => {
  axios.post(`${base}/login`, req.body)
    .then(response => {
      if (response.data.statuslogin == true) {
        app.locals.user = response.data;
        res.redirect('/');
      } else {
        app.locals.loginerror = true;
        res.redirect('/login');
      }
    })
    .catch(error => {
      res.redirect('/product');
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
    app.locals.editprofileerror = false;
  }
});

app.post('/editprofile', (req, res) => {
  console.log("id", app.locals.user.data.userid);
  axios.put(`${base}/updateuser/${app.locals.user.data.userid}`, req.body)
    .then(response => {
      if(response.data.updatefailed == true) {
        app.locals.editprofileerror = true;
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
      axios.get(`${base}/getallproduct`)
        .then(response => {
          app.locals.products = response.data;
          res.render('manageproduct.ejs', { products: app.locals.products });
        })
        .catch(error => {
          res.redirect('/');
        });
    })
    .catch(error => {
      res.redirect('/addproduct');
    });
});

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

app.get('/product/:category', (req, res) => {
  axios.get(`${base}/getproduct/${req.params.category}`)
    .then(response => {
      res.render('allproduct.ejs', { products: response.data });
    })
    .catch(error => {
      res.redirect('/');
      console.log(error);
    });
});

app.get('/editproduct/:id', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else if (app.locals.user.data.role != 'admin') {
    res.redirect('/');
  } else {
    axios.get(`${base}/getproductbyid/${req.params.id}`)
      .then(response => {
        res.render('editproduct.ejs', { product: response.data });
      })
      .catch(error => {
        res.redirect('/manageproduct');
      });
  }
});

app.post('/editproduct/:id', (req, res) => {
  axios.put(`${base}/updateproduct/${req.params.id}`, req.body)
    .then(response => {
      axios.get(`${base}/getallproduct`)
        .then(response => {
          app.locals.products = response.data;
          res.render('manageproduct.ejs', { products: app.locals.products });
        })
        .catch(error => {
          res.redirect('/');
        });
    })
    .catch(error => {
      res.redirect('/editproduct');
    });
});

app.get('/deleteproduct/:id', (req, res) => {
  axios.delete(`${base}/deleteproduct/${req.params.id}`)
    .then(response => {
      axios.get(`${base}/getallproduct`)
        .then(response => {
          app.locals.products = response.data;
          res.render('manageproduct.ejs', { products: app.locals.products });
        })
        .catch(error => {
          res.redirect('/');
        });
    })
    .catch(error => {
      res.redirect('/manageproduct');
    });
});

app.get('/cart', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else {
    axios.get(`${base}/getallcart/${app.locals.user.data.userid}`)
      .then(response => {
        let cart = response.data.cartuser;
        app.locals.cartlength = cart.length;

        if (cart == null || cart.length === 0) {
          res.render('cart.ejs', { cart: cart, product: [] });
        } else {
          // Filter out any null or undefined values from cart array
          cart = cart.filter(item => item && item.id);

          Promise.all(cart.map(item => {
            return axios.get(`${base}/getproductbyid/${item.id}`);
          }))
          .then(productResponses => {
            let product = [];

            productResponses.forEach(productResponse => {
              // Check if the productResponse.data is not null or undefined
              if (productResponse.data) {
                product.push(productResponse.data);
              }
            });

            res.render('cart.ejs', { cart: cart, product: product });
          })
          .catch(error => {
            res.redirect('/');
          });
        }
      })
      .catch(error => {
        res.redirect('/');
      });
  }
});

app.post('/addtocart', (req, res) => {
  if(app.locals.user == null) {
    res.redirect('/login');
  } else {
    axios.post(`${base}/addcart/${req.body.id}`, req.body)
      .then(response => {
        axios.get(`${base}/getallcart/${app.locals.user.data.userid}`)
          .then(response => {
            let cart = response.data.cartuser;
            app.locals.cartlength = cart.length;
            if (cart == null || cart.length === 0) {
              res.render('cart.ejs', { cart: cart, product: [] });
            } else {
              Promise.all(cart.map(item => {
                return axios.get(`${base}/getproductbyid/${item.id}`);
              }))
              .then(productResponses => {
                let product = [];

                productResponses.forEach(productResponse => {
                  product.push(productResponse.data);
                });

                res.render('cart.ejs', { cart: cart, product: product });
                // console.log(product);
              })
              .catch(error => {
                res.redirect('/');
              });
            }
          })
          .catch(error => {
            res.redirect('/');
          });
      })
      .catch(error => {
        res.redirect('/');
      });
  }
});

// delete cart item
app.get('/deleteitemscart/:id', (req, res) => {
  axios.post(`${base}/deletecart/${app.locals.user.data.userid}/${req.params.id}`)
    .then(response => {
      axios.get(`${base}/getallcart/${app.locals.user.data.userid}`)
        .then(response => {
          let cart = response.data.cartuser;
          app.locals.cartlength = cart.length;
          if (cart == null || cart.length === 0) {
            res.render('cart.ejs', { cart: cart, product: [] });
          } else {
            Promise.all(cart.map(item => {
              return axios.get(`${base}/getproductbyid/${item.id}`);
            }))
            .then(productResponses => {
              let product = [];

              productResponses.forEach(productResponse => {
                product.push(productResponse.data);
              });

              res.render('cart.ejs', { cart: cart, product: product });
            })
            .catch(error => {
              res.redirect('/');
            });
          }
        })
        .catch(error => {
          res.redirect('/');
        });
    })
    .catch(error => {
      console.log(error);
      res.redirect('/');
    });
});

// checkout
app.post('/checkout', (req, res) => {
  axios.post(`${base}/addorder/${app.locals.user.data.userid}`, req.body)
  .then(response => {
      app.locals.cartlength = 0;
      res.redirect('/history');
    })
    .catch(error => {
      res.redirect('/');
    });
});

app.get('/history', (req, res) => {
  if (app.locals.user == null) {
    res.redirect('/login');
  } else if(app.locals.user.data.role == 'admin') {
    axios.get(`${base}/getallorder`)
    .then(response => {
      res.render('history.ejs', { order: response.data });
      // console.log(response.data);
    })
    .catch(error => {
      res.redirect('/');
      console.log(error);
    });
  } else {
    axios.get(`${base}/getorderuser/${app.locals.user.data.userid}`)
    .then(response => {
      // app.locals.order = response.data;
      res.render('history.ejs', { order: response.data });
      // console.log(response.data);
    })
    .catch(error => {
      console.log(error);
      res.redirect('/');
    });
  }
});

// app.get('/order', (req, res) => {
//   if (app.locals.user == null) {
//     res.redirect('/login');
//   } else if (app.locals.user.data.role == 'admin') {
//     axios.get(`${base}/getallorder`)
//     .then(response => {
//       console.log(response.data);
//       // let productss = [];
//       // for(let i = 0; i < response.data.length; i++) {
//       //   let order = JSON.parse(response.data[i].cartuser);
//       //   axios.get(`${base}/getallproduct`)
//       //   .then(response => {
//       //     for (let j = 0; j < response.data.length; j++) {
//       //       for (let k = 0; k < order.length; k++) {
//       //         if (response.data[j].productid == order[k].id) {
//       //           productss.push(response.data[j]);
//       //         }
//       //       }
//       //     }
//       //     console.log(productss);
//       //     res.render('orderdetails.ejs', { order: response.data, productss: productss });
//       // //   })
//       // }
//     })
//   } else {
//     axios.get(`${base}/getorderuser/${app.locals.user.data.userid}`)
//       .then(response => {
//       let order = JSON.parse(response.data[0].cartuser);
//       axios.get(`${base}/getallproduct`)
//       .then(response => {
//         // เอา product ที่มี id ตรงกับ order มาเก็บไว้ใน productfororder
//         let productss = [];
//         for (let i = 0; i < response.data.length; i++) {
//           for (let j = 0; j < order.length; j++) {
//             if (response.data[i].productid == order[j].id) {
//               productss.push(response.data[i]);
//             }
//           }
//         }
//         res.render('orderdetails.ejs', { order: order, productss: productss });
//         console.log(order);
//         console.log(productss);
//       })
//       // console.log(response.data);
//   })
//   .catch(error => {
//     console.log(error);
//     res.redirect('/');
//   });
//   }
// });

app.get('/order/:orderid', (req, res) => {
  if(app.locals.user == null) {
    res.redirect('/login');
  } else {
    axios.get(`${base}/getbyorder/${req.params.orderid}`)
      .then(response => {
        let order = JSON.parse(response.data.cartuser);
        axios.get(`${base}/getallproduct`)
        .then(response => {
          let productss = [];
          for (let i = 0; i < response.data.length; i++) {
            for (let j = 0; j < order.length; j++) {
              if (response.data[i].productid == order[j].id) {
                productss.push(response.data[i]);
              }
            }
          }
          res.render('orderdetails.ejs', { order: order, productss: productss });
        })
        .catch(error => {
          console.log(error);
          res.redirect('/');
        });
      })
      .catch(error => {
        console.log(error);
        res.redirect('/');
      });
    }
});

app.get('/forgotpassword', (req, res) => {
  res.render('forgotpassword.ejs');
});

app.post('/forgotpassword', (req, res) => {
  axios.post(`${base}/forgotpassword`, req.body)
    .then(response => {
      if(response.data.checkforgot == true) {
        res.render('changepassword.ejs', { data: response.data });
      } else {
        res.redirect('/forgotpassword');
      }
    })
    .catch(error => {
      res.redirect('/forgotpassword');
    });
});

app.post('/changepassword', (req, res) => {
  axios.put(`${base}/updateuser/${req.body.userid}`, req.body)
    .then(response => {
      res.redirect('/login');
    })
    .catch(error => {
      res.redirect('/changepassword');
    });
});

// app.get('/changepassword', (req, res) => {
//   res.render('changepassword.ejs');
// });

// app.get('/manager', (req, res) => {
//   res.render('manager.ejs');
// });

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000/');
});
