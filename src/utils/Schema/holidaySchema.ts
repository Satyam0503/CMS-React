import * as Yup from "yup";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const holidaySchema = Yup.object().shape({
  holidayName: Yup.string().required("VALIDATION_ERR.HOLIDAY_NAME"),
  date: Yup.date().required("VALIDATION_ERR.HOLIDAY_DATE"),
  detail: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
  holidayType: Yup.string().required("VALIDATION_ERR.HOLIDAY_TYPE"),
  holidayImage: Yup.mixed()
    .nullable()
    .test("fileFormat", "VALIDATION_ERR.PICTURE_FORMAT", (value: any) => {
      if (value) {
        const supportedFormats = ["jpg", "png", "jpeg", "webp"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "VALIDATION_ERR.HOLIDAY_IMAGE_SIZE", (value: any) => {
      if (value) {
        return value.size <= MAX_FILE_SIZE;
      }
      return true;
    }),
});

export default holidaySchema;
