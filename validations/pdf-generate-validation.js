const Yup = require("yup");
let pdfValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is Required"),
  email: Yup.string().email().required("Email Address is Required"),
  contactNumber: Yup.string().required("Contact Number is Required"),
  message: Yup.string().required("Message is Required"),
});
module.exports = { pdfValidationSchema };
