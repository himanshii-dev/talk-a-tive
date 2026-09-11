import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talkative';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to database: ${mongoUri}`);

    // Clear existing collections
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log('[Seed] Cleared existing data');

    // Create demo users
    const usersData = [
      {
        name: 'Rahul Sharma',
        username: 'rahul',
        email: 'rahul@talkative.com',
        password: 'password123',
        bio: 'Building full-stack real-time products 🚀',
        status: 'Available',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isOnline: true,
      },
      {
        name: 'Priya Patel',
        username: 'priya',
        email: 'priya@talkative.com',
        password: 'password123',
        bio: 'UI/UX Designer & Frontend enthusiast ✨',
        status: 'Available',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        isOnline: true,
      },
      {
        name: 'Aman Gupta',
        username: 'aman',
        email: 'aman@talkative.com',
        password: 'password123',
        bio: 'Backend architect & distributed systems nerd ⚙️',
        status: 'Busy',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        isOnline: false,
      },
      {
        name: 'Sarah Jenkins',
        username: 'sarah',
        email: 'sarah@talkative.com',
        password: 'password123',
        bio: 'Product manager & agile coach 📊',
        status: 'Available',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        isOnline: false,
      },
      {
        name: 'Alex Rivera',
        username: 'alex',
        email: 'alex@talkative.com',
        password: 'password123',
        bio: 'DevOps & Cloud infrastructure engineer ☁️',
        status: 'Away',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isOnline: false,
      },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seed] Created ${createdUsers.length} users`);

    const [rahul, priya, aman, sarah, alex] = createdUsers;

    // 1. Direct Chat: Rahul & Priya
    const chatRahulPriya = await Chat.create({
      isGroupChat: false,
      groupName: 'sender',
      participants: [rahul._id, priya._id],
    });

    const m1 = await Message.create({
      chat: chatRahulPriya._id,
      sender: priya._id,
      content: 'Hey Rahul! Have you checked the latest UI layout for the conversation view?',
      deliveredTo: [priya._id, rahul._id],
      readBy: [priya._id, rahul._id],
      createdAt: new Date(Date.now() - 3600000 * 2),
    });

    const m2 = await Message.create({
      chat: chatRahulPriya._id,
      sender: rahul._id,
      content: 'Yes! The 3-column desktop layout and mobile drawer feel super smooth. Glassmorphic details look great.',
      replyTo: m1._id,
      deliveredTo: [rahul._id, priya._id],
      readBy: [rahul._id, priya._id],
      reactions: [{ emoji: '🔥', user: priya._id }],
      createdAt: new Date(Date.now() - 3600000 * 1.8),
    });

    const m3 = await Message.create({
      chat: chatRahulPriya._id,
      sender: priya._id,
      content: 'Awesome! Let us test real-time typing indicators and read receipts now.',
      deliveredTo: [priya._id, rahul._id],
      readBy: [priya._id, rahul._id],
      createdAt: new Date(Date.now() - 3600000 * 1.5),
    });

    chatRahulPriya.latestMessage = m3._id;
    await chatRahulPriya.save();

    // 2. Direct Chat: Rahul & Aman
    const chatRahulAman = await Chat.create({
      isGroupChat: false,
      groupName: 'sender',
      participants: [rahul._id, aman._id],
    });

    const m4 = await Message.create({
      chat: chatRahulAman._id,
      sender: aman._id,
      content: 'MongoDB indexing on participants and chat createdAt is working like a charm. Query response is under 5ms.',
      deliveredTo: [aman._id, rahul._id],
      readBy: [aman._id, rahul._id],
      reactions: [{ emoji: '👍', user: rahul._id }],
      createdAt: new Date(Date.now() - 3600000 * 4),
    });

    const m5 = await Message.create({
      chat: chatRahulAman._id,
      sender: rahul._id,
      content: 'Incredible work Aman! High-speed pagination makes loading message history effortless.',
      replyTo: m4._id,
      deliveredTo: [rahul._id, aman._id],
      readBy: [rahul._id, aman._id],
      createdAt: new Date(Date.now() - 3600000 * 3),
    });

    chatRahulAman.latestMessage = m5._id;
    await chatRahulAman.save();

    // 3. Group Chat: Talkative Dev Team
    const devGroup = await Chat.create({
      groupName: 'Talkative Dev Team',
      groupAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      groupDescription: 'Engineering, product design, and architectural discussion for Talk-a-tive.',
      isGroupChat: true,
      participants: [rahul._id, priya._id, aman._id, sarah._id, alex._id],
      admins: [rahul._id, priya._id],
      inviteToken: 'devteam2026',
    });

    const gm1 = await Message.create({
      chat: devGroup._id,
      sender: rahul._id,
      content: 'Rahul Sharma created the group "Talkative Dev Team"',
      messageType: 'system',
      createdAt: new Date(Date.now() - 86400000 * 2),
    });

    const gm2 = await Message.create({
      chat: devGroup._id,
      sender: sarah._id,
      content: 'Welcome everyone! We are launching the v1.0 release today.',
      deliveredTo: [sarah._id, rahul._id, priya._id, aman._id, alex._id],
      readBy: [sarah._id, rahul._id, priya._id],
      createdAt: new Date(Date.now() - 3600000 * 5),
    });

    const gm3 = await Message.create({
      chat: devGroup._id,
      sender: alex._id,
      content: 'Render and Vercel environments are fully configured with automated healthchecks.',
      deliveredTo: [alex._id, rahul._id, priya._id, aman._id, sarah._id],
      readBy: [alex._id, rahul._id, priya._id],
      reactions: [
        { emoji: '🔥', user: rahul._id },
        { emoji: '❤️', user: priya._id },
      ],
      createdAt: new Date(Date.now() - 3600000 * 3),
    });

    const gm4 = await Message.create({
      chat: devGroup._id,
      sender: rahul._id,
      content: 'Let us celebrate! 🎉 The real-time chat feels instantaneous.',
      replyTo: gm3._id,
      deliveredTo: [rahul._id, priya._id, aman._id, sarah._id, alex._id],
      readBy: [rahul._id, priya._id],
      reactions: [{ emoji: '❤️', user: sarah._id }],
      createdAt: new Date(Date.now() - 1800000),
    });

    devGroup.latestMessage = gm4._id;
    await devGroup.save();

    // Create sample notification
    await Notification.create({
      recipient: rahul._id,
      sender: priya._id,
      chat: devGroup._id,
      type: 'reaction',
      content: 'Priya Patel reacted with ❤️ to your message in Talkative Dev Team',
      isRead: false,
    });

    await Notification.create({
      recipient: rahul._id,
      sender: alex._id,
      chat: devGroup._id,
      type: 'new_message',
      content: 'Alex Rivera in Talkative Dev Team: Render and Vercel environments are fully configured',
      isRead: true,
    });

    console.log('[Seed] Database populated successfully with demo users, chats, and messages!');
    console.log('[Seed] Demo Credentials:');
    console.log('   Email: rahul@talkative.com | Password: password123');
    console.log('   Email: priya@talkative.com | Password: password123');
    console.log('   Email: aman@talkative.com  | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
