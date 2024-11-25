const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission', // Reference to Permission model
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Role', roleSchema);
