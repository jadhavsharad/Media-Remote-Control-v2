import { AiFillInfoCircle } from "react-icons/ai"
import { IoIosBuild } from "react-icons/io"
import { FaGithub, FaLink } from "react-icons/fa6"
import SectionTitle from "@/components/ui/SectionTitle"
import Card from "@/components/ui/Card"
import Divider from "@/components/ui/Divider"

const About = () => {
  return (
    <div>
      <SectionTitle>About</SectionTitle>
      <Card className="items-center justify-between font-bold">
        <div className="flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2"><AiFillInfoCircle />Version</div>
          <p>1.0</p>
        </div>
        <Divider line />
        <div className="flex items-center justify-between text-xs w-full">
          <div className="flex items-center gap-2"><IoIosBuild />Last Build</div>
          <p>2025</p>
        </div>
        <Divider line />
        <a href="https://github.com/jadhavsharad/Media-Remote-Control-v2" className="cursor-pointer w-full flex justify-between">
          <div className="flex items-center gap-2 text-xs">  <FaGithub /> View on Github</div>
          <FaLink />
        </a>
      </Card>
    </div>
  )
}

export default About
