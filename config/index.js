require("dotenv").config();

module.exports = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    APP_NAME: process.env.APP_NAME || "Node Backend",
    HOST: process.env.HOST || "localhost",
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
    jwt: {
        secret: process.env.APP_KEY,
        ttl: process.env.APP_JWT_TTL,
    },
    AWS: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucketName: process.env.AWS_BUCKET_NAME,
    },
    IP_WHITELIST: process.env.IP_WHITELIST || "http://localhost:3000",
    AUTHORIZE_NET_API_LOGIN_ID: process.env.AUTHORIZE_NET_API_LOGIN_ID,
    AUTHORIZE_NET_KEY: process.env.AUTHORIZE_NET_KEY,
    CUSTOMER_SITE_URL: process.env.CUSTOMER_SITE_URL,
};
