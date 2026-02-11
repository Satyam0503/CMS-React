export type payrollSettingModel = {
    payrollSettingsId?: string,
    employeeId: string,
    basicPay: number,
    bonus: number,
    paidDays: number,
    HRA: number,
    LTA: number,
    otherAllowance: number,
    lossOfPaydays: number,
    lossOfPay: number,
    incomeTax: number,
    healthInsurance: number,
    grossPay: number,
    totalDeduction: number,
    isActive: boolean,
    netPay: number
}