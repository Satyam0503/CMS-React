import { FormattedMessage } from "react-intl";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";

export const SetDepartmentName = ({ department }: { department: Record<string, string> | null }) => {
    const { currentLanguage } = useAppLang();
    const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);
    if (!department) {
        return <FormattedMessage id="NOT_AVAILABLE" />;
    } else {
        const depName = department[currentLanguage] || department[defaultLang];
        return depName;
    }
}