const Header = ({ title }: { title: string }) => {
  return (
    <header className="w-full text-center uppercase ">
      <h1 className="font-bold">{title}</h1>
    </header>
  )
}

export default Header
