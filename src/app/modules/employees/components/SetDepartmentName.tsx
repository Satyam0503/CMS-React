import { FormattedMessage } from "react-intl";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";

export const SetDepartmentName = ({ department }: { department: Record<string, string> | null }) => {
    const { currentLanguage } = useAppLang();
    const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);
    if (!department || Object.keys(department).length === 0) {
        return <FormattedMessage id="NOT_AVAILABLE" />;
    }

    // Department labels are localized. Older records can use a language key that
    // does not exactly match the active/default locale, so fall back to any label.
    return department[currentLanguage] || department[defaultLang] || Object.values(department)[0] || <FormattedMessage id="NOT_AVAILABLE" />;
}
