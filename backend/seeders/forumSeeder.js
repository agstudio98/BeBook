const ForumTopic = require('../models/ForumTopic');
const User = require('../models/User');

const seedForum = async () => {
  const forumCount = await ForumTopic.countDocuments();
  if (forumCount > 0) return 0;

  const baseUser = await User.findOne({ isAdmin: true }) || await User.findOne();
  if (!baseUser) return 0;

  const topics = [
    { 
      user: baseUser._id, 
      title: 'What is your favorite book of 2026?', 
      content: 'I would like to know what you have been reading this year and which ones you recommend.', 
      category: 'Literatura' 
    },
    { 
      user: baseUser._id, 
      title: 'Effective study techniques', 
      content: 'Let\'s share methods to improve concentration when reading heavy notes.', 
      category: 'Estudio' 
    },
    { 
      user: baseUser._id, 
      title: 'Upcoming events at BeBook', 
      content: 'Does anyone know when the next reading night at the Palermo branch is?', 
      category: 'Eventos' 
    }
  ];

  await ForumTopic.insertMany(topics);
  return topics.length;
};

module.exports = seedForum;
