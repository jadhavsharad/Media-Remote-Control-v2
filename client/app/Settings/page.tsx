import Header from "@/components/Header"
// import PremiumBanner from "@/components/settings/PremiumBanner"
import Appearance from "@/components/settings/Appearance"
import ConnectionInfo from "@/components/settings/ConnectionInfo"
import About from "@/components/settings/About"
import PageTransition from "@/components/PageTransition"

const SettingsPage = () => {
  return (
    <PageTransition>
      <div className="p-4">
        <Header title="Settings" />
        {/* <PremiumBanner /> */}
        <Appearance />
        <ConnectionInfo />
        <About />
      </div>
    </PageTransition>
  )
}

export default SettingsPage