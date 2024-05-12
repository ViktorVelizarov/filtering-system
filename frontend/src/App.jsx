import React, { useEffect, useState } from "react";
import { FaDoorOpen } from "react-icons/fa";
import { BiSolidArea } from "react-icons/bi";
import { FaChartArea } from "react-icons/fa6";
import { TbFilterSearch } from "react-icons/tb";
import { CiChat1 } from "react-icons/ci";

function PropertyCard({ property }) {
  return (
    <div className="flex rounded-lg shadow-md bg-white my-4">
      <img src="https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?cs=srgb&dl=pexels-binyaminmellish-186077.jpg&fm=jpg" alt="Property" className="w-1/4 rounded-l-lg object-cover" style={{ margin: '1.1rem', borderRadius: '0.5rem' }} />
      <div className="flex flex-col justify-between w-3/4 p-4">
        <div>
          <h2 className="font-bold text-lg">{property.Title}</h2>
          <p>€ {property.Price}</p>
          <div className="flex flex-row mt-3">
            <p className="flex flex-row items-center mr-3"><BiSolidArea className="mr-2"/>{property.SurfaceArea} m</p>
            <p className="flex flex-row items-center mr-3"><FaChartArea className="mr-2"/> {property.PlotSurfaceArea} m</p>
            <p className="flex flex-row items-center"><FaDoorOpen className="mr-2"/>{property.Rooms}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


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
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/houses")
      .then((res) => res.json())
      .then((data) => setHouses(data));
  }, []);

   // Toggle popup visibility
   const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Filter houses based on search query, price range, plot area range, surface area range, and rooms range
  const filteredHouses = houses.filter(house => {
    const addressMatch = house.GoogleMapsAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const priceMatch = (!fromPrice || parseInt(house.Price) >= parseInt(fromPrice)) && (!toPrice || parseInt(house.Price) <= parseInt(toPrice));
    const plotAreaMatch = (!fromPlotArea || parseInt(house.PlotSurfaceArea) >= parseInt(fromPlotArea)) && (!toPlotArea || parseInt(house.PlotSurfaceArea) <= parseInt(toPlotArea));
    const surfaceAreaMatch = (!fromSurfaceArea || parseInt(house.SurfaceArea) >= parseInt(fromSurfaceArea)) && (!toSurfaceArea || parseInt(house.SurfaceArea) <= parseInt(toSurfaceArea));
    const roomsMatch = (!fromRooms || parseInt(house.Rooms) >= parseInt(fromRooms)) && (!toRooms || parseInt(house.Rooms) <= parseInt(toRooms));
    return addressMatch && priceMatch && plotAreaMatch && surfaceAreaMatch && roomsMatch;
  });

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 ml-8 relative">
       {/* Button to toggle popup */}
       <button onClick={togglePopup} className="fixed bottom-8 right-8 bg-blue-500 text-white py-2 px-4 rounded-full flex items-center justify-center z-10">
       <CiChat1 />
      </button>

      {/* Popup */}
      {showPopup && (
        <div className="fixed bottom-20 right-8 bg-white p-4 rounded-md shadow-md z-20">
          <form>
            <label htmlFor="propertyInfo"></label>
            <input type="text" id="propertyInfo" name="propertyInfo" />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {/* Logo */}
      <img src="https://s3-alpha-sig.figma.com/img/007f/79fe/c01197223699abbb0d1d5590814b974f?Expires=1714348800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=BlXiTXE0prJUrwGCBgY7K7VYGSh1-KY4YvIHyoCxpjegTUiBbEhh0NFcOGSJ2qOyNKiuo-cWuKAp4QXezDAD-pf2MViQDm3jCUoDrgZVzG2K3IlInVm1EfGydHlEpgHBZZ5Q7ggSCxak16RD2fghNJBuLSOi-GJl11fcYyRiftpimeVxKyyDivhLzdenv2zkGE5b4ztw7c4miNVeMlulYcvpSXNZbhNBJfs9GnPZeFJ6gTrkskcKa4aJaHf-s-nZKhT4J23WG3i1fkdW4S9usTg8-TbP~ule0rdNXAicrxOXSiU1LQ8MUgTUvzEwJKWYVGjGEDCO2jwdmYPlxjgfmA__" alt="Logo" className="absolute top-0 left-0 mt-4 ml-4" style={{ width: '100px', height: '100px' }} />

      {/* Filters section */}
      <div className="md:col-span-1">
        <button className="bg-black rounded-md w-60 text-white flex flex-row items-center my-4 px-2 py-1"><TbFilterSearch /> Filters</button>
        {/* Price filters */}
        <p className="font-medium"> Price</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromPrice}
            onChange={(e) => setFromPrice(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toPrice}
            onChange={(e) => setToPrice(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Plot area filters */}
        <p className="font-medium"> Plot Area</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromPlotArea}
            onChange={(e) => setFromPlotArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toPlotArea}
            onChange={(e) => setToPlotArea(e.target.value
            )}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Surface area filters */}
        <p className="font-medium"> Surface area</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromSurfaceArea}
            onChange={(e) => setFromSurfaceArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toSurfaceArea}
            onChange={(e) => setToSurfaceArea(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
        {/* Rooms filters */}
        <p className="font-medium"> Rooms</p>
        <div className="my-4 flex flex-row items-center">
          <input 
            type="number" 
            placeholder="" 
            value={fromRooms}
            onChange={(e) => setFromRooms(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3 mr-2"
          />
          <p className="ml-2 mr-4"> to </p>
          <input 
            type="number" 
            placeholder="" 
            value={toRooms}
            onChange={(e) => setToRooms(e.target.value)}
            className="px-2 py-1 border border-gray-400 w-1/3"
          />
        </div>
      </div>

      {/* Search and Property Cards */}
      <div className="md:col-span-3">
        {/* Search bar */}
        <input 
          type="text" 
          placeholder="Search by address..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="my-4 px-2 py-1 border border-gray-400 w-full rounded-md"
        />
        {/* Property Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredHouses.map((house) => (
            <PropertyCard key={house.PropertyID} property={house} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
