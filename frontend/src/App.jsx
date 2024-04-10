import React, { useEffect, useState } from "react";

function App() {
  const [houses, setHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch("http://localhost:3000/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

  // Filter houses based on search query
  const filteredHouses = houses.filter(house => house.GoogleMapsAddress.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="container mx-auto">
      {/* Search bar */}
      <input 
        type="text" 
        placeholder="Search by address..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="my-4 px-2 py-1 border border-gray-400"
      />
      <table className="table-auto w-full text-left border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Title
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Price
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Rooms
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Construction Year
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              General Info
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Google Maps Address
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Surface Area
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Plot Surface Area
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Construction Type
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredHouses.map((house) => (
            <tr key={house.PropertyID} className="border border-gray-400 hover:bg-gray-100">
              <td className="px-4 py-2">{house.Title}</td>
              <td className="px-4 py-2">{house.Price}</td>
              <td className="px-4 py-2">{house.Rooms}</td>
              <td className="px-4 py-2">{house.ConstructionYear}</td>
              <td className="px-4 py-2">{house.GeneralInfo}</td>
              <td className="px-4 py-2">{house.GoogleMapsAddress}</td>
              <td className="px-4 py-2">{house.SurfaceArea}</td>
              <td className="px-4 py-2">{house.PlotSurfaceArea}</td>
              <td className="px-4 py-2">
                {house.Bouwsoort}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
