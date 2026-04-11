import Image from "next/image"

const MediaCover = () => {
  return (
    <div className="mx-auto w-4/6 aspect-square rounded-full overflow-hidden">
      <div className="w-full h-full bg-zinc-950/70 rounded-[inherit] flex items-center justify-center">
        <Image
          loading="eager"
          src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Media Artwork"
          title="Media Artwork"
          width={2048}
          height={2048}
          className="rounded-[inherit] h-full w-full object-cover"
        />
      </div>
    </div>
  )
}

export default MediaCover
