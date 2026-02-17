const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime-chat';

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedUser = async () => {
    try {
        const password = process.env.PASSWORD || '71125';
        const usersToSeed = [
            { username: 'vishnu', password: password },
            { username: 'hima', password: password }
        ];

        for (const u of usersToSeed) {
            let user = await User.findOne({ username: u.username });
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            if (user) {
                console.log(`Updating user: ${u.username}`);
                user.password = hashedPassword;
                await user.save();
            } else {
                console.log(`Creating user: ${u.username}`);
                const newUser = new User({
                    username: u.username,
                    password: hashedPassword,
                    onlineStatus: false
                });
                await newUser.save();
            }
        }

        // Remove any users that are NOT vishnu or hima
        await User.deleteMany({ username: { $nin: ['vishnu', 'hima'] } });
        console.log('Removed extraneous users.');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUser();
