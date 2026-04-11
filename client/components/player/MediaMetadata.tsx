const MediaMetadata = () => {
  return (
    <div className="mx-auto text-center flex flex-col gap-4">
      <h1 aria-label="Media title" className="font-bold text-xl md:text-2xl">Lorem ipsum dolor sit amet adipisicing elit. Quisquam.</h1>
      <p aria-label="Media artist" className="text-xs md:text-sm text-zinc-400 font-black">Lorem ipsum dolor sit amet.</p>
      <p aria-label="Media album" className="text-xs md:text-sm text-zinc-400">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam.</p>
    </div>
  )
}

export default MediaMetadata
