import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Real Estate Homepage</title>
      </Head>
      <main className="relative">
      <div className="background-image" style={{ backgroundImage: "url('/house4.jpg')" }}>
          <div className="content-overlay">
            <h1 className="text-5xl mb-4">Let's find a home that is perfect for you</h1>
            <p className="text-xl mb-8">Want to find a home? We are ready to help you find one that suits your lifestyle and needs.</p>
            <Link href="/properties" className="bg-white text-gray-800 px-3 py-2 rounded-lg text-xl">
            Discover More
            </Link>
          </div>
        </div>
        <div className="search-section">
          <div className="filter-item">
            <label htmlFor="property-type" className="block font-bold">Property Type:</label>
            <select id="property-type" className="block px-4 py-2 rounded border border-gray-300">
              <option value="house">Buy a House</option>
              <option value="apartment">Buy an Apartment</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="price-range" className="block font-bold">From:</label>
            <select id="price-dropdown" className="block px-4 py-2 rounded border border-gray-300">
              <option value="250000">250,000 EUR</option>
              {/* Other options */}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="price-range" className="block font-bold">To:</label>
            <select id="price-dropdown" className="block px-4 py-2 rounded border border-gray-300">
              <option value="650000">650,000 EUR</option>
              {/* Other options */}
            </select>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Enter Location..." className="px-4 py-2 rounded border border-gray-300" />
            <select className="px-4 py-2 rounded border border-gray-300">
              <option value="5km">5 km</option>
              {/* Other options */}
            </select>
            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg">Search</button>
          </div>
        </div>
      </main>
    </div>
  );
}
