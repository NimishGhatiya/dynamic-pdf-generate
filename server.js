const express = require("express");
const PDFDocument = require("pdfkit");
const Yup = require("yup");
const fs = require("fs");
const path = require("path");
const { styleText } = require("util");
const {
  pdfValidationSchema,
} = require("./validations/pdf-generate-validation");

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure directory exists

const outputDir = path.join(__dirname, "pdfs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
app.post("/pdf-generate", async (req, res) => {
  try {
    // validation
    await pdfValidationSchema.validate(req.body);

    const { name, email, message, contactNumber } = req.body;
    // create a pdf document

    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const fileName = `profile-${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);
    doc.pipe(fs.createWriteStream(filePath));

    // add static image
    const backgroundImage = path.join(__dirname, "images", "bg.svg");
    const photoPath = path.join(__dirname, "images", "default-profile.svg");
    doc.image(backgroundImage, 0, 0, { width: 600 });

    // define layout and add dynamic content

    // header secction (photo + name email)

    const photoX = 70;
    const photoY = 20;
    const photoSize = 80;

    // add the static circular photo

    doc.save();
    doc
      .circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2)
      .clip();
    doc.image(photoPath, photoX, photoY, { width: photoSize });
    doc.restore();

    // Name and email (Bold) --

    const textX = photoX + photoSize + 20;
    const nameY = photoY + 15;
    const emailY = nameY + 25;
    const contactX = nameY + 45;
    doc.font("Helvetica-Bold").fillColor("#0000000");
    doc.fontSize(22).text(name, textX, nameY);
    doc.fontSize(12).text(email, textX, emailY, { link: `mailTo:${email}` });
    doc.fontSize(22).text(contactNumber, textX, contactX);

    // message section

    const messageX = 50;
    const messageY = photoY + photoSize + 40;
    doc.font("Helvetica").fillColor("#333333").fontSize(11);
    doc.text(message, messageX, messageY, {
      width: 450,
      align: "left",
      lineGap: 4,
    });

    // finalize the pdf
    doc.end();

    console.log("PDF generated successfully", filePath);
    return res
      .status(200)
      .json({
        statusCode: 200,
        message: "pdf generated successfully",
        path: `files/${fileName}`,
      });
  } catch (error) {
    console.error("Error occure while pdf generate", error);
    return res.status(500).json({
      statusCode: 500,
      message: "pdf generation failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT} number`);
});
