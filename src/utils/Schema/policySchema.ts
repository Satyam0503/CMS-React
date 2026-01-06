import * as Yup from "yup";
import { AddPolicyModel } from "../../app/modules/policies/models";

export const policySchema: Yup.ObjectSchema<AddPolicyModel> = Yup.object().shape({
    policyId:Yup.string().optional(),
    policyName: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    description: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    departments: Yup.array().of(Yup.string().required()).default([]),
    roles: Yup.array().of(Yup.string().required()).default([]),
    isActive: Yup.boolean().required("VALIDATION_ERR.REQUIRED_TYPE")
})

export const policyVersionSchema = Yup.object().shape({
    versionName: Yup.string().required("VALIDATION_ERR.REQUIRED_TYPE"),
    policyDoc: Yup.mixed().nullable(),
    isCurrent: Yup.boolean()
})