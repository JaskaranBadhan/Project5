import { findOne, create } from '../models/User';
const seedAdmin = async () => {
    try {
        const adminExists = await findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user check: Admin user already exists. Updating credentials...');
            adminExists.username = 'Hiralal'; // Ensure username is consistent
            adminExists.email = 'hiralal@studycircle.com'; // Ensure email is consistent
            adminExists.password = 'hiralalpassword123'; // Triggers pre-save hash
            adminExists.isBanned = false;
            await adminExists.save();
            console.log('Admin user updated successfully');
        } else {
            await create({
                username: 'Hiralal',
                email: 'hiralal@studycircle.com',
                password: 'hiralalpassword123', // Will be hashed by pre-save hook
                role: 'admin',
                isBanned: false
            });
            console.log('Admin user created successfully');
        }
        console.log('Email: hiralal@studycircle.com');
        console.log('Password: hiralalpassword123');
    } catch (error) {
        console.error(`Admin Seeding Error: ${error.message}`);
    }
};
export default seedAdmin;