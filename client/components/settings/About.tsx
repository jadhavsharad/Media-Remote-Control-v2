import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import Divider from "@/components/ui/Divider"
import { Icons } from "@/lib/icons"

const About = () => {

  const lastBuild = process.env.NEXT_PUBLIC_LAST_BUILD || 0
  const RemoteV = process.env.NEXT_PUBLIC_REMOTE_V || 0

  return (
    <div>
      <SectionTitle>About</SectionTitle>
      <Card className="items-center justify-between font-bold">
        <div className="flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2"><Icons.info />Remote Version</div>
          <p>{RemoteV}</p>
        </div>
        <Divider line />
        <div className="flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2"><Icons.build />Last Build</div>
          <p>{lastBuild}</p>
        </div>
        <Divider line />
        <a rel="noopener noreferrer" target="_blank" href="https://github.com/jadhavsharad/Media-Remote-Control-v2" className="cursor-pointer w-full flex justify-between">
          <div className="flex items-center gap-2 text-xs">  <Icons.github /> View on Github</div>
          <Icons.link />
        </a>
      </Card>
    </div>
  )
}

export default About
