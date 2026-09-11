import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';
const SOCKET_URL = 'http://127.0.0.1:5000';

const runE2ETests = async () => {
  console.log('\n========================================');
  console.log('🚀 TALK-A-TIVE FULL-STACK E2E TEST SUITE');
  console.log('========================================\n');

  try {
    // 1. Health check
    console.log('[1/8] Verifying Server Health...');
    const health = await axios.get(`${API_URL}/health`);
    console.log(`  ✓ Health status: ${health.data.status} (Uptime: ${health.data.uptime.toFixed(1)}s)`);

    // 2. Authentication: Login User 1 (Rahul)
    console.log('\n[2/8] Authenticating Rahul Sharma...');
    const rahulLogin = await axios.post(`${API_URL}/auth/login`, {
      loginId: 'rahul@talkative.com',
      password: 'password123',
    });
    const rahulToken = rahulLogin.data.data.token;
    const rahulUser = rahulLogin.data.data;
    console.log(`  ✓ Rahul authenticated (ID: ${rahulUser._id})`);

    // 3. Authentication: Login User 2 (Priya)
    console.log('\n[3/8] Authenticating Priya Patel...');
    const priyaLogin = await axios.post(`${API_URL}/auth/login`, {
      loginId: 'priya@talkative.com',
      password: 'password123',
    });
    const priyaToken = priyaLogin.data.data.token;
    const priyaUser = priyaLogin.data.data;
    console.log(`  ✓ Priya authenticated (ID: ${priyaUser._id})`);

    // 4. Socket.IO Real-Time Handshake for both users
    console.log('\n[4/8] Establishing Real-Time Socket.IO Connections...');
    const rahulSocket = io(SOCKET_URL, { transports: ['websocket'] });
    const priyaSocket = io(SOCKET_URL, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let connectedCount = 0;
      const checkDone = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      rahulSocket.on('connect', () => {
        rahulSocket.emit('setup', rahulUser);
        console.log('  ✓ Rahul Socket connected');
        checkDone();
      });
      priyaSocket.on('connect', () => {
        priyaSocket.emit('setup', priyaUser);
        console.log('  ✓ Priya Socket connected');
        checkDone();
      });
    });

    // 5. Fetch Chats and access 1-on-1 between Rahul and Priya
    console.log('\n[5/8] Accessing 1-on-1 Chat...');
    const chatRes = await axios.post(
      `${API_URL}/chats`,
      { userId: priyaUser._id },
      { headers: { Authorization: `Bearer ${rahulToken}` } }
    );
    const chat = chatRes.data.data;
    console.log(`  ✓ Direct Chat retrieved (ID: ${chat._id})`);

    // Rahul and Priya join chat room
    rahulSocket.emit('joinChat', chat._id);
    priyaSocket.emit('joinChat', chat._id);

    // 6. Test Real-time Messaging and Delivery
    console.log('\n[6/8] Sending Real-Time Message and Verifying Socket Broadcast...');
    const messagePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Socket message timeout')), 5000);
      priyaSocket.on('receiveMessage', (msg) => {
        clearTimeout(timeout);
        console.log(`  ✓ Priya received message via Socket.IO: "${msg.content}"`);
        resolve(msg);
      });
    });

    const sendRes = await axios.post(
      `${API_URL}/messages`,
      {
        chatId: chat._id,
        content: 'E2E Automated verification message: Talk-a-tive is live! 🔥',
      },
      { headers: { Authorization: `Bearer ${rahulToken}` } }
    );
    const sentMsg = sendRes.data.data;
    console.log(`  ✓ Message saved in MongoDB (ID: ${sentMsg._id})`);
    rahulSocket.emit('sendMessage', sentMsg);

    await messagePromise;

    // 7. Test Message Reaction
    console.log('\n[7/8] Testing Message Emoji Reaction...');
    const reactRes = await axios.post(
      `${API_URL}/messages/${sentMsg._id}/react`,
      { emoji: '🔥' },
      { headers: { Authorization: `Bearer ${priyaToken}` } }
    );
    console.log(`  ✓ Priya reacted with 🔥. Total reactions: ${reactRes.data.data.reactions.length}`);

    // 8. Test Group Invite Link
    console.log('\n[8/8] Testing Group Chat & Invite Token Flow...');
    const groupRes = await axios.post(
      `${API_URL}/groups`,
      {
        groupName: 'Automated Test Squad',
        users: [priyaUser._id],
      },
      { headers: { Authorization: `Bearer ${rahulToken}` } }
    );
    const group = groupRes.data.data;
    console.log(`  ✓ Group created (ID: ${group._id}, Invite Token: ${group.inviteToken})`);

    const invitePreview = await axios.get(`${API_URL}/groups/invite/${group.inviteToken}`);
    console.log(`  ✓ Invite link resolved publicly: "${invitePreview.data.data.groupName}"`);

    // Clean disconnect
    rahulSocket.disconnect();
    priyaSocket.disconnect();

    console.log('\n========================================');
    console.log('🎉 ALL 8/8 END-TO-END TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E Test Failure:', error.response?.data || error.message);
    process.exit(1);
  }
};

runE2ETests();
