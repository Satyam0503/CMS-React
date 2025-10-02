type PropsType = {
    password: string;
}

const atLeastOneUppercase = /[A-Z]/g; // capital letters from A to Z
const atLeastOneLowercase = /[a-z]/g; // small letters from a to z
const atLeastOneNumeric = /[0-9]/g; // numbers from 0 to 9
const atLeastOneSpecialChar = /[#?!@$%^&*-]/g; // any of the special characters within the square brackets
const eightCharsOrMore = /.{8,}/g; // eight characters or more

export const PasswordStrenghtMeter = ({ password }: PropsType) => {
    const passwordTracker = {
        uppercase: password.match(atLeastOneUppercase),
        lowercase: password.match(atLeastOneLowercase),
        number: password.match(atLeastOneNumeric),
        specialChar: password.match(atLeastOneSpecialChar),
        eightCharsOrGreater: password.match(eightCharsOrMore),
    };
    const passwordStrength = Object.values(passwordTracker).filter(
        (value) => value
    ).length;

    return (
        <div className="password-meter-container">
            {
                Object.keys(passwordTracker).map((item, index) =>
                    <div key={index} className="password-meter-block" data-active-block={passwordStrength >= index + 1}></div>
                )
            }
        </div>
    )
}