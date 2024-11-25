const bcrypt = require('bcryptjs');

const password = 'password'; // Replace this with your password

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;

  bcrypt.hash(password, salt, (err, hashedPassword) => {
    if (err) throw err;
    console.log('Hashed Password:', hashedPassword);
  });
});