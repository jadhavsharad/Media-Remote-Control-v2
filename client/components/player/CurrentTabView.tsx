import Image from "next/image"

const CurrentTabView = () => {
  return (
    <div className="mx-auto my-4 flex items-center gap-4 bg-zinc-100 dark:bg-white/5 border border-white/5 px-4 py-2 rounded-full">
      <Image src={"https://www.google.com/s2/favicons?sz=64&domain=youtube.com"} alt="Favicon" title="Favicon" width={128} height={128} className="w-8 aspect-square" />
      <div className="truncate">
        <h1 className="text-xs text-zinc-400 font-semibold">Now Playing</h1>
        <a href="/" className="text-xs text-zinc-400 truncate lowercase">Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam porro soluta aliquid fugiat dolor quod quidem inventore ducimus at molestiae alias, minima necessitatibus repellendus omnis obcaecati ad quas velit adipisci sapiente consequuntur aspernatur deleniti. Veritatis fugit autem vitae, iste quisquam necessitatibus corrupti dolorem dolorum architecto. Ad sapiente ipsum explicabo aspernatur numquam aliquid aliquam laboriosam ullam veniam sit, consectetur amet magnam, repellat facilis laborum eos tempora? Quas assumenda rem asperiores libero incidunt explicabo, est laudantium facere hic totam commodi atque. Ullam temporibus odio distinctio quidem alias, nemo magni, quam culpa laboriosam commodi tenetur nam placeat quae ipsum qui nobis, veritatis eaque!
        </a>
      </div>
    </div>
  )
}

export default CurrentTabView
