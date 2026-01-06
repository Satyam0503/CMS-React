import * as Yup from "yup";
import { AddPolicyModel } from "../../app/modules/policies/models";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const policySchema: Yup.ObjectSchema<AddPolicyModel> = Yup.object().shape({
    policyId: Yup.string().optional(),
    policyName: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    description: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    departments: Yup.array().of(Yup.string().required()).default([]),
    roles: Yup.array().of(Yup.string().required()).default([]),
    isActive: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE")
})

export const policyVersionSchema = Yup.object().shape({
    versionName: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    isCurrent: Yup.boolean(),
    policyDoc: Yup.mixed().nullable()
        .test("fileFormat", "VALIDATION_ERR.DOCUMENT_FORMAT", (value: any) => {
            if (value) {
                const supportedFormats = ["pdf", "doc", "docx"];
                return supportedFormats.includes(value.name.split(".").pop());
            }
            return true;
        })
        .test("fileSize", "VALIDATION_ERR.PROFILE_PICTURE_SIZE", (value: any) => {
            if (value) {
                return value.size <= MAX_FILE_SIZE;
            }
            return true;
        }),
})