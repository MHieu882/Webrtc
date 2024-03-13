const groupSchema = new Schema({
    Groupname: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    // Thêm các trường khác nếu cần
  })
  module.exports = mongoose.model('Group',groupSchema);