import mongoose from 'mongoose';
import 'dotenv/config';
import CertificateTemplate from './models/CertificateTemplate.js';
import connectDB from './configs/mongodb.js';

const seedTemplates = async () => {
    try {
        await connectDB();
        
        const templates = [
            {
                title: "Professional Gold",
                htmlContent: `
                    <div style="border: 20px solid #D4AF37; padding: 50px; text-align: center; font-family: 'Outfit', sans-serif; background: #fff;">
                        <h1 style="font-size: 50px; color: #D4AF37;">CERTIFICATE OF COMPLETION</h1>
                        <p style="font-size: 20px;">This is to certify that</p>
                        <h2 style="font-size: 40px; border-bottom: 2px solid #333; display: inline-block; padding-bottom: 10px;">{{student_name}}</h2>
                        <p style="font-size: 20px;">has successfully completed the course</p>
                        <h3 style="font-size: 30px; color: #333;">{{course_title}}</h3>
                        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                            <div style="text-align: left;">
                                <p>Date: {{date}}</p>
                                <p>Certificate ID: {{certificate_id}}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-family: 'Dancing Script', cursive; font-size: 30px;">PrismEd Authority</p>
                                <p>Authorized Signatory</p>
                            </div>
                        </div>
                    </div>
                `,
                cssContent: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;900&display=swap'); body { margin: 0; padding: 0; }",
                fontSize: "32px",
                fontFamily: "Outfit",
                isDefault: true
            },
            {
                title: "Modern Slate",
                htmlContent: `
                    <div style="background: #1e293b; color: #f8fafc; padding: 60px; text-align: center; font-family: 'Inter', sans-serif; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50px; right: -50px; width: 200px; hright: 200px; background: #6366f1; transform: rotate(45deg);"></div>
                        <h1 style="font-size: 45px; letter-spacing: 5px; color: #818cf8;">EXCELLENCE AWARD</h1>
                        <p style="opacity: 0.7;">This credential acknowledges that</p>
                        <h2 style="font-size: 55px; font-weight: 900;">{{student_name}}</h2>
                        <p style="opacity: 0.7;">mastered all modules within</p>
                        <h3 style="font-size: 25px; color: #c084fc;">{{course_title}}</h3>
                        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p>Verification ID: {{certificate_id}} | Issued on {{date}}</p>
                        </div>
                    </div>
                `,
                cssContent: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap');",
                fontSize: "28px",
                fontFamily: "Inter",
                isDefault: false
            },
            {
                title: "Classic Academic",
                htmlContent: `
                    <div style="border: 2px solid #333; outline: 10px double #333; outline-offset: -20px; padding: 80px; text-align: center; font-family: 'Playfair Display', serif;">
                        <h1 style="font-size: 60px; text-transform: uppercase;">Acheivement Credential</h1>
                        <p style="font-style: italic;">Publicly verifying the scholarly pursuits of</p>
                        <h2 style="font-size: 50px; font-weight: normal;">{{student_name}}</h2>
                        <p>in the domain of</p>
                        <h3 style="font-size: 35px; text-decoration: underline;">{{course_title}}</h3>
                        <div style="margin-top: 100px;">
                            <p>Presented this day, {{date}}</p>
                            <p style="font-size: 12px; margin-top: 20px;">ID: {{certificate_id}}</p>
                        </div>
                    </div>
                `,
                cssContent: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,900;1,400&display=swap');",
                fontSize: "24px",
                fontFamily: "Playfair Display",
                isDefault: false
            }
        ];

        await CertificateTemplate.deleteMany({});
        await CertificateTemplate.insertMany(templates);
        
        console.log('3 Certificate Templates Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
};

seedTemplates();
