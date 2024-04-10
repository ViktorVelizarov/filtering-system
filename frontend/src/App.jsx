import React, { useEffect, useState } from "react";

function App() {
  const [houses, setHouses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromPrice, setFromPrice] = useState('');
  const [toPrice, setToPrice] = useState('');
  const [fromPlotArea, setFromPlotArea] = useState('');
  const [toPlotArea, setToPlotArea] = useState('');
  const [fromSurfaceArea, setFromSurfaceArea] = useState('');
  const [toSurfaceArea, setToSurfaceArea] = useState('');
  const [fromRooms, setFromRooms] = useState('');
  const [toRooms, setToRooms] = useState('');
  const [fromConstructionYear, setFromConstructionYear] = useState('');
  const [toConstructionYear, setToConstructionYear] = useState('');

  useEffect(() => {
    fetch("http://localhost:3000/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

  // Filter houses based on search query, price range, plot area range, surface area range, rooms range, and construction year range
  const filteredHouses = houses.filter(house => {
    const addressMatch = house.GoogleMapsAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const priceMatch = (!fromPrice || parseInt(house.Price) >= parseInt(fromPrice)) && (!toPrice || parseInt(house.Price) <= parseInt(toPrice));
    const plotAreaMatch = (!fromPlotArea || parseInt(house.PlotSurfaceArea) >= parseInt(fromPlotArea)) && (!toPlotArea || parseInt(house.PlotSurfaceArea) <= parseInt(toPlotArea));
    const surfaceAreaMatch = (!fromSurfaceArea || parseInt(house.SurfaceArea) >= parseInt(fromSurfaceArea)) && (!toSurfaceArea || parseInt(house.SurfaceArea) <= parseInt(toSurfaceArea));
    const roomsMatch = (!fromRooms || parseInt(house.Rooms) >= parseInt(fromRooms)) && (!toRooms || parseInt(house.Rooms) <= parseInt(toRooms));
    const constructionYearMatch = (!fromConstructionYear || parseInt(house.ConstructionYear) >= parseInt(fromConstructionYear)) && (!toConstructionYear || parseInt(house.ConstructionYear) <= parseInt(toConstructionYear));
    return addressMatch && priceMatch && plotAreaMatch && surfaceAreaMatch && roomsMatch && constructionYearMatch;
  });

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
      {/* Price filters */}
      <div className="flex my-4">
        <input 
          type="number" 
          placeholder="From price" 
          value={fromPrice}
          onChange={(e) => setFromPrice(e.target.value)}
          className="mr-2 px-2 py-1 border border-gray-400"
        />
        <input 
          type="number" 
          placeholder="To price" 
          value={toPrice}
          onChange={(e) => setToPrice(e.target.value)}
          className="px-2 py-1 border border-gray-400"
        />
      </div>
      {/* Plot area filters */}
      <div className="flex my-4">
        <input 
          type="number" 
          placeholder="From plot area" 
          value={fromPlotArea}
          onChange={(e) => setFromPlotArea(e.target.value)}
          className="mr-2 px-2 py-1 border border-gray-400"
        />
        <input 
          type="number" 
          placeholder="To plot area" 
          value={toPlotArea}
          onChange={(e) => setToPlotArea(e.target.value)}
          className="px-2 py-1 border border-gray-400"
        />
      </div>
      {/* Surface area filters */}
      <div className="flex my-4">
        <input 
          type="number" 
          placeholder="From surface area" 
          value={fromSurfaceArea}
          onChange={(e) => setFromSurfaceArea(e.target.value)}
          className="mr-2 px-2 py-1 border border-gray-400"
        />
        <input 
          type="number" 
          placeholder="To surface area" 
          value={toSurfaceArea}
          onChange={(e) => setToSurfaceArea(e.target.value)}
          className="px-2 py-1 border border-gray-400"
        />
      </div>
      {/* Rooms filters */}
      <div className="flex my-4">
        <input 
          type="number" 
          placeholder="From rooms" 
          value={fromRooms}
          onChange={(e) => setFromRooms(e.target.value)}
          className="mr-2 px-2 py-1 border border-gray-400"
        />
        <input 
          type="number" 
          placeholder="To rooms" 
          value={toRooms}
          onChange={(e) => setToRooms(e.target.value)}
          className="px-2 py-1 border border-gray-400"
        />
      </div>
      {/* Construction year filters */}
      <div className="flex my-4">
        <input 
          type="number" 
          placeholder="From construction year" 
          value={fromConstructionYear}
          onChange={(e) => setFromConstructionYear(e.target.value)}
          className="mr-2 px-2 py-1 border border-gray-400"
        />
        <input 
          type="number" 
          placeholder="To construction year" 
          value={toConstructionYear}
          onChange={(e) => setToConstructionYear(e.target.value)}
          className="px-2 py-1 border border-gray-400"
        />
      </div>
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
              Address
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Surface Area
            </th>
            <th className="px-4 py-2 bg-gray-100 text-xs font-semibold text-left border border-gray-400">
              Plot Area
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

