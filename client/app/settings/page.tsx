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
        <div className="w-full py-4 flex justify-center">
          <a rel="noopener noreferrer" target="_blank" href="https://www.buymeacoffee.com/jadhavsharad"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=jadhavsharad&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
        </div>
      </div>

    </PageTransition>
  )
}

export default SettingsPage