import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";

export const SetDepartmentName = ({ department }: { department: Record<string, string> }) => {
    const { currentLanguage } = useAppLang();
    const defaultLang = useAppSelector(state => state.user.userData?.defaultLanguage!);
    const depName = department[currentLanguage] || department[defaultLang];
    return depName;
}