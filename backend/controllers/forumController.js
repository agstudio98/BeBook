const ForumTopic = require('../models/ForumTopic');
const ForumReply = require('../models/ForumReply');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('./activityController');

/**
 * @desc    Get all topics (with search and filter)
 * @route   GET /api/forum/topics
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getTopics = asyncHandler(async (req, res) => {
  const { keyword, category } = req.query;

  const searchCriteria = {};

  if (keyword) {
    searchCriteria.title = {
      $regex: keyword,
      $options: 'i',
    };
  }

  if (category && category !== 'Todas') {
    searchCriteria.category = category;
  }

  const topics = await ForumTopic.find(searchCriteria)
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(topics);
});

/**
 * @desc    Get a topic by ID and its replies
 * @route   GET /api/forum/topics/:id
 * @access  Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const getTopicById = asyncHandler(async (req, res) => {
  const topicId = req.params.id;
  const topic = await ForumTopic.findById(topicId).populate('user', 'name');
  
  if (!topic) {
    res.status(404);
    throw new Error('Tema no encontrado');
  }

  topic.views += 1;
  await topic.save();
  
  const replies = await ForumReply.find({ topic: topicId })
    .populate('user', 'name')
    .sort({ createdAt: 1 });
    
  res.json({ topic, replies });
});

/**
 * @desc    Create a new topic
 * @route   POST /api/forum/topics
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const createTopic = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;
  const userId = req.user._id;

  if (!title || !content) {
    res.status(400);
    throw new Error('Por favor, completa todos los campos');
  }

  const topic = new ForumTopic({
    user: userId,
    title,
    content,
    category: category || 'General',
  });

  const createdTopic = await topic.save();

  await logActivity(
    userId,
    'FORUM_TOPIC',
    `Creaste un nuevo tema: "${title}"`,
    createdTopic._id,
    null,
    { title }
  );

  res.status(201).json(createdTopic);
});

/**
 * @desc    Add a reply to a topic
 * @route   POST /api/forum/topics/:id/replies
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const addReply = asyncHandler(async (req, res) => {
  const { content, parentReplyId } = req.body;
  const topicId = req.params.id;
  const userId = req.user._id;
  
  const topic = await ForumTopic.findById(topicId);

  if (!topic) {
    res.status(404);
    throw new Error('Tema no encontrado');
  }

  const replyData = {
    user: userId,
    topic: topicId,
    content,
  };

  // Only add parentReply if it's a valid ObjectId
  if (parentReplyId && parentReplyId.match(/^[0-9a-fA-F]{24}$/)) {
    replyData.parentReply = parentReplyId;
  }

  const reply = new ForumReply(replyData);
  const createdReply = await reply.save();
  
  await logActivity(
    userId,
    'FORUM_REPLY',
    `Respondiste al tema "${topic.title}"`,
    createdReply._id,
    null,
    { topicTitle: topic.title }
  );

  // Update reply count
  topic.numReplies = await ForumReply.countDocuments({ topic: topic._id });
  await topic.save();

  // Return populated reply
  const populatedReply = await ForumReply.findById(createdReply._id).populate('user', 'name');
  
  if (populatedReply.parentReply) {
    await populatedReply.populate({
      path: 'parentReply',
      populate: { path: 'user', select: 'name' }
    });
  }

  res.status(201).json(populatedReply);
});

/**
 * @desc    Update a reply
 * @route   PUT /api/forum/replies/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const updateReply = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const replyId = req.params.id;
  const userId = req.user._id;

  const reply = await ForumReply.findById(replyId);

  if (!reply) {
    res.status(404);
    throw new Error('Respuesta no encontrada');
  }

  if (reply.user.toString() !== userId.toString()) {
    res.status(401);
    throw new Error('No autorizado');
  }

  reply.content = content || reply.content;
  reply.isEdited = true;

  const updatedReply = await reply.save();
  const populatedReply = await ForumReply.findById(updatedReply._id).populate('user', 'name');
  
  res.json(populatedReply);
});

/**
 * @desc    Delete a reply
 * @route   DELETE /api/forum/replies/:id
 * @access  Private
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
const deleteReply = asyncHandler(async (req, res) => {
  const replyId = req.params.id;
  const { _id: userId, isAdmin } = req.user;

  const reply = await ForumReply.findById(replyId);

  if (!reply) {
    res.status(404);
    throw new Error('Respuesta no encontrada');
  }

  if (reply.user.toString() !== userId.toString() && !isAdmin) {
    res.status(401);
    throw new Error('No autorizado');
  }

  const topicId = reply.topic;
  
  // Delete "children" replies
  await ForumReply.deleteMany({ parentReply: replyId });
  await ForumReply.deleteOne({ _id: replyId });

  // Update reply count
  const topic = await ForumTopic.findById(topicId);
  if (topic) {
    topic.numReplies = await ForumReply.countDocuments({ topic: topicId });
    await topic.save();
  }

  res.json({ message: 'Respuesta eliminada' });
});

module.exports = {
  getTopics,
  getTopicById,
  createTopic,
  addReply,
  updateReply,
  deleteReply,
};
