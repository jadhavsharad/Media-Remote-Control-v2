const Header = ({ title }: { title: string }) => {
  return (
    <header className="w-full text-center mx-auto my-8">
      <h1 className="font-bold">{title}</h1>
    </header>
  )
}

export default Header
