require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.AWS_REGION
});

app.post('/api/get-presigned-url', async (req, res) => {
    const { fileType } = req.body;

    if (!fileType) {
        return res.status(400).json({ error: 'fileType is required' });
    }

    const fileName = `uploads/${Math.random().toString(36).substring(7)}`;
    const fileExtension = fileType.split('/')[1];
    const fullFileName = `${fileName}.${fileExtension}`;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: fullFileName,
        ContentType: fileType
    };

    try {
        const command = new PutObjectCommand(params);
        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        const getCommand = new GetObjectCommand(params);
        const viewUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
        res.json({
            presignedUrl,
            viewUrl,
            fileName: fullFileName
        });
    } catch (error) {
        console.error('Presigned URL generation error:', error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));