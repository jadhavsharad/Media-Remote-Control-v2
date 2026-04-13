import { AiFillInfoCircle } from "react-icons/ai"
import { CgDarkMode } from "react-icons/cg"
import { FaHome, FaVolumeMute } from "react-icons/fa"
import { FaBackward, FaForward, FaGithub, FaLink, FaPause, FaPlay, FaStop, FaVolumeHigh, FaVolumeLow } from "react-icons/fa6"
import { IoIosBuild } from "react-icons/io"
import { IoGrid, IoLayers, IoMoon, IoPhonePortraitOutline, IoSettings, IoSunny } from "react-icons/io5"
import { TbBookmarksFilled, TbCopy, TbRefresh } from "react-icons/tb"
import { FaChrome, FaWindows, FaLinux, FaApple, FaBrave, FaEdge, FaFirefox, FaQuestion, FaOpera, FaYandex, FaAndroid, } from "react-icons/fa6"

export const Icons = {
  // playback
  play: FaPlay,
  pause: FaPause,
  stop: FaStop,
  backward: FaBackward,
  forward: FaForward,

  // volume
  volumeUp: FaVolumeHigh,
  volumeDown: FaVolumeLow,
  volumeMute: FaVolumeMute,

  // actions
  bookmark: TbBookmarksFilled,
  copy: TbCopy,
  refresh: TbRefresh,

  // theme
  light: IoSunny,
  dark: IoMoon,
  theme: CgDarkMode,

  // others
  github: FaGithub,
  link: FaLink,
  build: IoIosBuild,
  info: AiFillInfoCircle,
  question: FaQuestion,
  home: FaHome,
  settings: IoSettings,
  tabs: IoLayers,
  quickLaunch: IoGrid, 
  phone: IoPhonePortraitOutline,

  // browser
  chrome: FaChrome,
  brave: FaBrave,
  edge: FaEdge,
  firefox: FaFirefox,
  opera: FaOpera,
  yandex: FaYandex,

  // platform
  android: FaAndroid,
  windows: FaWindows,
  linux: FaLinux,
  mac: FaApple,

} as const
