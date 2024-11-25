const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
        // type:String,
        // required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role', // Reference to Role model
      required: false,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
