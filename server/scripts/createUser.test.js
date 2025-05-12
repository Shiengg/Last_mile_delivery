const axios = require('axios');

const createAdminUser = async () => {
    try {
        console.log('Đang tạo Admin user...');
        const adminUser = {
            username: "admin",
            email: "admin@gmail.com",
            password: "123123123",
            role: "Admin",
            phone: "0123456789"
        };

        console.log('Đang gửi dữ liệu đăng ký:', {
            ...adminUser,
            password: '***'
        });

        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', adminUser);
        console.log('Đăng ký thành công:', {
            ...registerResponse.data,
            token: registerResponse.data.token ? 'JWT Token...' : null
        });

        console.log('\nĐang thử đăng nhập...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            username: adminUser.username,
            password: adminUser.password
        });

        console.log('Đăng nhập thành công:', {
            ...loginResponse.data,
            token: loginResponse.data.token ? 'JWT Token...' : null
        });

        console.log('\nThông tin đăng nhập Admin:');
        console.log('Username:', adminUser.username);
        console.log('Password:', adminUser.password);

    } catch (error) {
        if (error.response) {
            console.error('Lỗi từ server:', {
                status: error.response.status,
                data: error.response.data
            });

            if (error.response.data.message.includes('role')) {
                console.log('\nGợi ý: Cần cập nhật model User để chấp nhận role "Admin"');
            } else if (error.response.status === 409) {
                console.log('\nGợi ý: User đã tồn tại, có thể thử đăng nhập trực tiếp');
            }
        } else if (error.request) {
            console.error('Không thể kết nối đến server. Hãy đảm bảo server đang chạy trên port 5000');
        } else {
            console.error('Lỗi:', error.message);
        }
    }
};

const main = async () => {
    try {
        await createAdminUser();
    } catch (error) {
        console.error('Lỗi không mong muốn:', error);
    }
};

main(); 