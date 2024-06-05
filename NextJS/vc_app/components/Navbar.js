"use client"

export default function () {
return(
    <header className="px-16">
   <img className="main-img" src="logo1.png" alt="Description of the image"></img>
    <nav>
      <ul className="flex gap-4">
        <li><a href="#" className="hover:text-gray-300">About</a></li>
        <li><a href="#" className="hover:text-gray-300">Services</a></li>
        <li><a href="#" className="hover:text-gray-300">Property Listings</a></li>
        <li><a href="#" className="hover:text-gray-300">Log In</a></li>
        <li><a href="#" className="hover:text-gray-300">Contact Us</a></li>
      </ul>
    </nav>
  </header>
)
}