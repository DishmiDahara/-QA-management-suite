const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  bugId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bug', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
