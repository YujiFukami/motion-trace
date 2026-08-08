import MotionPlayground from "@/components/MotionPlayground";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

export default function Home() {
  return (
    <LocaleProvider>
      <MotionPlayground />
    </LocaleProvider>
  );
}
